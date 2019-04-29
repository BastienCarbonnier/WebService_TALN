/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    rezo        = require('./request_rezo'),
    Tree        = require('./Tree'),
    Node        = require('./Tree');

let {PythonShell} = require('python-shell');
function parserPhrase(phrase,mc_tree,callback){
    var options = {
        mode: 'text',
        scriptPath: './python/',
        args: []
    };
    options.args[0] = phrase;
    // On récupère les pos_tag de chaque mots
    PythonShell.run('get_pos_tag.py', options, function (err, results) {
        if (err) throw err;
        console.log(results[0])
        //let tab_phrase = JSON.parse(JSON.stringify(results[0]));
        let tab_phrase = JSON.parse(results[0]);
        console.log(tab_phrase);

        // On vérifie si la phrase contient des mots composés
        mc_tree.containsCompoundWord(tab_phrase, (err,exist,max_cw)=>{
            console.log(max_cw);
            // On join les mots composés et on adapte les index en conséquence
            joinCompoundWords (tab_phrase,max_cw,(tab_phrase_cw)=>{
                options.args[0] = JSON.stringify(tab_phrase_cw);

                // ajouter gestion regex : find CompoundWordWithRegex
                // Créer un fichier de regex

                // On propage les pos tag par proximité
                PythonShell.run('propage_pos_tag.py', options, function (err, results) {
                    if (err) throw err;
                    let phrase_pos_prop = JSON.parse(results[0]);
                    console.log("###### ########Après avoir propagé les pos_tag : ");
                    console.log(phrase_pos_prop);


                    callback(phrase_pos_prop);

                });
            });

        });

    });
}

function joinCompoundWords (phrase,cw_index,callback){
    let decalage = 0;
    async.forEachOf(cw_index, (size_cw, index_cw, callbackFor) => {
        if (size_cw == 0){
            if(index_cw-decalage<phrase.length)
            phrase[index_cw-decalage].index = index_cw-decalage;
            callbackFor();
        }
        else{
            let words_joined = phrase[index_cw-decalage];

            let word_to_join = phrase.slice(index_cw+1-decalage,index_cw+size_cw-decalage);

            async.forEachOf(word_to_join, (word, key, callbackFor1) => {
                words_joined.mot += " " + word.mot;
                callbackFor1();
            }, err => {
                if (err) console.error(err.message);

                phrase.splice(index_cw+1-decalage,index_cw+size_cw-2-decalage);
                //// TODO: Finir recupération pos tag jeuxdemots
                rezo.getPosTagFromJDM(words_joined.mot,(pos_tag)=>{
                    words_joined.nature = pos_tag;
                    words_joined.index = index_cw-decalage;
                    phrase[index_cw-decalage] = words_joined;
                    decalage = decalage + size_cw-1;
                    callbackFor();
                });

            });
        }
    }, err => {
        if (err) console.error(err.message);
        console.log(phrase);
        callback(phrase);
    });

    /*
    Gérer les relative : que qui
    subordonné avec que

    la nourriture de cet hôtel que j'aime bien est déguelasse

    groupe nominaux prépositionnel

    négation en priorité également (mettre un paramètre pour inverser)

    voir ce qui est urgent dans les avis


    suivi taln mettre les heuristiques
    définir une mesure sur 100 avis par exemple

    pattern devoir : devoir faire un effort

    la qualité de la nourriture est remarquable

    qualité du services


    satisfait appareil


    injecteur des regex (avant mot composé)
     */
}

module.exports.parserPhrase = parserPhrase;

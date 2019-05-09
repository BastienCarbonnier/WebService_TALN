/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async         = require("async"),
    rp            = require('request-promise'),
    cheerio       = require('cheerio'),
    windows1252   = require('windows-1252'),
    rezo          = require('./request_rezo'),
    Tree          = require('./Tree'),
    Node          = require('./Tree'),
    cache_pos_tag = require('./ressources/caches/cache_pos_tag/gestion_cache');

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
        console.log(results[0]);
        //let tab_phrase = JSON.parse(JSON.stringify(results[0]));
        let tab_phrase = JSON.parse(results[0]);
        console.log(tab_phrase);

        // On vérifie si la phrase contient des mots composés
        mc_tree.containsCompoundWord(tab_phrase, (err,exist,max_cw)=>{
            console.log(max_cw);
            // On join les mots composés et on adapte les indexs en conséquence
            joinCompoundWords (tab_phrase,max_cw,(tab_phrase_cw)=>{
                postagCompoundWords (tab_phrase_cw,(tab_phrase_cw_tag)=>{

                    // ajouter gestion regex : find CompoundWordWithRegex
                    // Créer un fichier de regex
                    async.forEachOf(tab_phrase_cw_tag, (value, key, callbackFor1) => {
                        cache_pos_tag.getFromCache(value.mot, (find,data)=>{
                            if (find){
                                console.log("####### Data cache");
                                console.log(data);
                                tab_phrase_cw_tag[value.index].nature = data.nature;
                                callbackFor1();
                            }
                            else{
                                callbackFor1();
                            }
                        });

                    }, err => {
                        if (err) console.error(err.message);
                        options.args[0] = JSON.stringify(tab_phrase_cw_tag);
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

        });

    });
}

function joinCompoundWords (phrase,cw_index,callback){
    let decalage = 0;
    // Boucle sur chaque index des mots composés (index,taille)
    async.forEachOf(cw_index, (size_cw, index_cw, callbackFor) => {
        if (size_cw == 0){
            if(index_cw-decalage<phrase.length&&index_cw-decalage>0)
                phrase[index_cw-decalage].index = index_cw-decalage;
            callbackFor();
        }
        else{
            let words_joined = phrase[index_cw-decalage];
            console.log("index_cw, decalage : ");
            console.log(index_cw);
            console.log(decalage);
            console.log(phrase);
            // On récupère les mots à lier entre eux
            let word_to_join = phrase.slice(index_cw+1-decalage,index_cw+size_cw-decalage);

            // Boucle sur chaque mot à lier
            async.forEachOf(word_to_join, (word, key, callbackFor1) => {
                words_joined.mot += " " + word.mot;
                callbackFor1();
            }, err => {
                if (err) console.error(err.message);
                else{

                    let new_index = index_cw-decalage;
                    phrase.splice(new_index+1,size_cw-1);

                    words_joined.lemme = "<unknown>";
                    words_joined.index = index_cw-decalage;
                    words_joined.nature = "TOFIND";
                    phrase[index_cw-decalage] = words_joined;
                    decalage = decalage + size_cw-1;
                    callbackFor();
                }

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
function postagCompoundWords(phrase,callback) {
    async.forEachOf(phrase, (value, key, callbackFor) => {
        if (value.nature=="TOFIND"){
            cache_pos_tag.getFromCache(value.mot, (find,data)=>{
                if (find){
                    phrase[value.index].nature = data.nature;
                    callbackFor();
                }
                else{
                    // Récupération du pos tag sur jeux de mots
                    rezo.getPosTagFromJDM(value.mot,(pos_tag)=>{
                        cache_pos_tag.addToCache({id : "",mot : value.mot,nature : pos_tag},()=>{
                            phrase[value.index].nature = data.nature;
                            callbackFor();
                        });
                    });
                }
            });
        }
        else{
            callbackFor();
        }

    }, err => {
        if (err) console.error(err.message);
        else{
            callback(phrase);
        }

    });

}

module.exports.parserPhrase = parserPhrase;

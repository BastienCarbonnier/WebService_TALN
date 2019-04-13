/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    Tree        = require('./Tree'),
    Node        = require('./Tree');

let {PythonShell} = require('python-shell');
function parserPhrase(phrase,mc_tree,callback){
    var options = {
        mode: 'json',
        scriptPath: '/Users/bca/Workspace/TER_M1_Hotel_Advisor/WebService_TALN/python/',
        args: []
    };

    options.args[0] = phrase;
    // Verifier mots composés
    PythonShell.run('parse_sentence.py', options, function (err, results) {
        if (err) throw err;

        let tab_phrase = JSON.parse(JSON.stringify(results[0]));
        console.log(tab_phrase);
        let phrase_struc = "";
        // ReVerifier mots composés et recupérer les natures correspondantes
        async.forEachOf(tab_phrase, (value, key, callbackFor) => {

            phrase_struc += value.mot+ " ";

            callbackFor();

        }, err => {
            if (err) console.error(err.message);
            phrase_struc = phrase_struc.substr(0,phrase_struc.length-1);

            mc_tree.containsCompoundWord(phrase_struc, (err,exist,max_cw)=>{
                console.log(max_cw);
            });

            /*
            Gérer les relative : que qui
            subordonné avec que

            la nourriture de cet hôtel qeu j'aime bien est déguelasse

            groupe nominaux prépositionnel

            négation en priorité également

            voir ce qui est urgent dans les avis


            suivi taln mettre les heuristiques
            définir une mesure sur 100 avis par exemple

            pattern devoir : devoir faire un effort

            la qualité de la nourriture est remarquable

            qualité du services


            satisfait appareil


            injecteur des regex
             */
            callback();
        });

        callback(tab_phrase);

    });
}

module.exports.parserPhrase = parserPhrase;

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

        // ReVerifier mots composés et recupérer les natures correspondantes

        callback(tab_phrase);

    });
}

module.exports.parserPhrase = parserPhrase;

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
function parserPhrase(phrase,callback){
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

/*

var tree = new Tree('CEO');

tree.add('VP of Happiness', 'CEO', tree.traverseBF);
tree.add('VP of Finance', 'CEO', tree.traverseBF);
tree.add('VP of Sadness', 'CEO', tree.traverseBF);

tree.add('Director of Puppies', 'VP of Finance', tree.traverseBF);
tree.add('Manager of Puppies', 'Director of Puppies', tree.traverseBF);
tree.traverseDF(function(node) {
console.log(node.data);
});
*/

module.exports.parserPhrase = parserPhrase;

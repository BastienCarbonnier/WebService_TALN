/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    fs          = require('fs'),
    Tree        = require('./Tree'),
    Node        = require('./Tree');


function initialisation (callback){

    fs.readFile("./ressources/mots_composes_utf8.txt","utf-8", (err, mc) => {

        if (err) throw err;
        let mc_tab = mc.split("\n");
        creationArbrePrefixe(mc_tab, (mc_tree)=>{
            callback(mc_tree);
        });
    });

    // http://www.jeuxdemots.org/JDM-LEXICALNET-FR/05012019-LEXICALNET-JEUXDEMOTS-ENTRIES-MWE.txt
/*
    var mc = fs.readFileSync("./ressources/mots_composes.txt","binary");
    var mc_tab = mc.split("\n");
    creationArbrePrefixe(mc_tab, (mc_tree)=>{
        var url = windows1252.encode("http://www.jeuxdemots.org/JDM-LEXICALNET-FR/05012019-LEXICALNET-JEUXDEMOTS-ENTRIES-MWE.txt");
        console.log(url);
        const options = {
            uri: url,
            encoding: 'binary',
            transform: function (body) {
                return cheerio.load(body, {decodeEntities: false});
            }
        };

        rp(options)
        .then(($) => {

            var result = $.text();
            console.log("Telechargement de la page terminé");
            fs.appendFile("./mots_composes_new.txt", result, (err) => {
                if (err) throw err;
                console.log('Ecriture terminé');
                callback(mc_tree);
            });

        })
        .catch((err) => {
            console.log(err);
        });

    });
*/
}


function creationArbrePrefixe(mc_tab,callback){
    console.log("####### Creation de l'arbre des préfixes #######");

    let mc_tree = new Tree("");

    mc_tab = mc_tab.slice(0,7);

    // Boucle sur chaque mot composés
    async.forEachOf(mc_tab, (value, key, callbackFor) => {

        let mot = value.split(";")[1];
        console.log(mot);
        mc_tree.addWord(mot, (err) => {
            if(err) console.log(err);
            callbackFor();
        });

    }, err => {
        if (err) console.error(err.message);
        console.log("Arbre crée");
        callback(mc_tree);
    });
}

module.exports.initialisation = initialisation;

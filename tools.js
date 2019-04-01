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
    fs.readFile("./mots_composes.txt","binary", (err, mc) => {
        if (err) throw err;
        let mc_tab = mc.split("\n");
        creationArbrePrefixe(mc_tab, (mc_tree)=>{
            mc_tree.containsCompoundWord("tache de rousseur", (response)=>{
                console.log(response);
            });
            callback(mc_tree);
        });
    });

}

function creationArbrePrefixe(mc_tab,callback){
    console.log("####### Creation de l'arbre des préfixes #######");

    let mc_tree = new Tree("");

    mc_tab = mc_tab.slice(0,21);
    /*
    for (let i in mc_tab){
        console.log(mc_tab[i]);
    }
    */

    // Boucle sur chaque mot composés
    async.forEachOf(mc_tab, (value, key, callbackFor) => {

        let mot = value.split(";")[1];
        mc_tree.addWord(mot, (err) => {
            if(err) console.log(err);
            //console.log("mot ajouté");
            callbackFor();
        });

    }, err => {
        if (err) console.error(err.message);
        console.log("Arbre crée");
        /*
        mc_tree.traverseDF((node) => {
            console.log(node);
        });
        */
        callback(mc_tree);
    });
}

module.exports.initialisation = initialisation;

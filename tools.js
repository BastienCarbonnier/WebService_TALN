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
            /*
            mc_tree.containsCompoundWord("tache de rousseur", (response)=>{
                console.log(response);
            });
            */
            let words = ["La","vache","bleu"];
           findCompoundWords(mc_tree,words, (err)=>{

           });

            callback(mc_tree);
        });
    });

}
function findCompoundWords(mc_tree,words,callback){

    let i = 0;

    let find = false;

    async.whilst(
        function () { return  !find && i < words.length; },//check condition.
        function (callback1) {
            let k = i;

            let mot = words[k];
            k++;
            for (;k<words.length;k++){
                mot += " "+words[k];
            }
            console.log(mot);

            mc_tree.containsCompoundWord(mot, (err,exist)=>{
                let change = false;
                if(exist){
                    words.splice(i,k-2);
                    words[i]=mot;
                    find = true;
                }
                i++;
                callback1(null,words,change);
            });
        },
        function (err,new_words,change) { //final result
            words = new_words;
            i = words.length;
            find = false;
            async.whilst(
                function () { return  !find && i > 0; },//check condition.
                function (callback2) {
                    let k = i;

                    let mot = words[k];
                    k++;
                    for (;k>0;k--){
                        mot += " "+words[k];
                    }
                    console.log(mot);

                    mc_tree.containsCompoundWord(mot, (err,exist)=>{
                        let change = false;
                        if(exist){
                            words.splice(i,k-2);
                            words[i]=mot;
                            find = true;
                        }
                        i--;
                        callback2(null,words,change);
                    });
                },
                function (err,new_words2,change2) { //final result
                    console.log("Après recherche des mots composés");
                    console.log(new_words2);
                    console.log(change2);
                    callback(null,false);
                }
            );
        }
    );
}
function creationArbrePrefixe(mc_tab,callback){
    console.log("####### Creation de l'arbre des préfixes #######");

    let mc_tree = new Tree("");

    mc_tab = mc_tab.slice(0,21);

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

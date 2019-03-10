/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var express     = require('express'),
    async       = require("async"),
    polarisation = require('./polarisation'),
    parseur     = require('./parseur'),
    tools       = require('./tools');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    let mc_tree;
    parseur.parserPhrase(req.query.phrase,mc_tree, (tab_phrase)=>{
        polarisation.getPolaritePhrase(tab_phrase, (tab_phrase_polarise)=>{
            res.json(tab_phrase_polarise);
        });
    });


});

tools.initialisation(()=>{
    app.listen(port, (err) => {
        if (err) {
            return console.log('something bad happened', err);
        }

        console.log(`server is listening on ${port}`);
    });
});


/*
Polarité vecteur de trois valeur

gestion petit en dur

20 % neg 20% neutre 60% positif
propagé un vecteur

le bateau à voile

le bateau = tête

tête prend un poids plus important que le reste et on propage

corenlp
treetager

google nlp

Mots composé
structure arbre préfixe sérialisé

lemmatiser que le verbe


Structure sous forme d'arbre
tête de la phrase groupe verbale

groupe nominal


A faire :

Mots composé : supprimer mots (majuscule)
Regarder analyseur

 */

/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var express     = require('express'),
    async       = require("async"),
    polarisation = require('./polarisation'),
    parseur     = require('./parseur'),
    tools       = require('./tools');
var cors = require('cors');
var bodyParser = require('body-parser');

const app = express();
app.use(cors());
//app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
const port = 3000;

let mc_tree;
app.post('/', (req, res) => {
	console.log(req.body.phrase);
	try{
		parseur.parserPhrase(req.body.phrase,mc_tree, (tab_phrase)=>{
			console.log(tab_phrase+" après parser");
			polarisation.getVecteurPolaritePhrase(tab_phrase, (tab_phrase_polarise)=>{
				console.log("test "+tab_phrase_polarise);
				 res.setHeader("Content-type", "application/json");
				res.end(JSON.stringify(tab_phrase_polarise));
			});
		});
	}
	catch(e) {
		console.log(e);
	}

});

tools.initialisation((tree)=>{
    mc_tree = tree;
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

/*jslint node: true */
/*jshint esversion: 6 */
/*jshint expr: true */

var express      = require('express'),
    async        = require("async"),
    polarisation = require('./polarisation'),
    parseur      = require('./parseur'),
    tools        = require('./tools'),
    cors         = require('cors'),
    bodyParser   = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 3000;

let mc_tree;
app.post('/', (req, res) => {
	try{
		parseur.parserPhrase(req.body.phrase,mc_tree, (tab_phrase)=>{
			polarisation.getVecteurPolaritePhrase(tab_phrase, (tab_phrase_polarise)=>{
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

/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    rezo        = require('./request_rezo'),
    cache       = require('./ressources/caches/cache_polarisation/gestion_cache');

function getVecteurPolaritePhrase(phrase,callback){
    let phrase_pol = [];
    async.forEachOf(phrase, (value, key, callbackFor) => {
        let mot_pol = {};
        mot_pol = value;


        if (mot_pol.nature!="ADP" && mot_pol.nature!="DET"){
            getVecteurPolariteMot(value.mot,value.lemme,function(pol){
                mot_pol.pol = pol;
                phrase_pol[value.index]=mot_pol;
                callbackFor();
            });
        }
        else{
            mot_pol.pol = {neg : 0,pos:0,neutre:0};
            phrase_pol[value.index]=mot_pol;
            callbackFor();
        }


    }, err => {
        if (err) console.error(err.message);

        propagerPolariteVecteur(phrase_pol, (phrase_propa) =>{
            callback(phrase_propa);
        });


    });
}

function filter_array(array) {
    var index = -1,
        arr_length = array ? array.length : 0,
        resIndex = -1,
        result = [];

    while (++index < arr_length) {
        var value = array[index];

        if (value) {
            result[++resIndex] = value;
        }
    }

    return result;
}

// Lexique a part et coefficient d'intensification
// gérer négation : ne et pas inversion
function propagerPolariteVecteur(tokens,callback){

    let phrase_pol = [];

    async.forEachOf(tokens, (value, key, callbackFor) => {
        let current = {};

        current = value;
        /*
        if (current.nature == "ADJ") {

            async.forEachOf(current.index_adv,(value, key, callbackFor2) => {
                let token = tokens[value];

                if (token.pol<0 && current.pol <=0){
                    current.pol--;
                }
                else if (token.pol>0 && current.pol >=0) {
                    current.pol++;
                }
                else if (token.pol>0 && current.pol<0){
                    current.pol--;
                }
                callbackFor2();

            }, err => {
                if (err) console.error(err.message);
                phrase_pol[current.index]=current;
                callbackFor();
            });
        }
        else{
            phrase_pol[current.index]=current;
            callbackFor();
        }
        */
       phrase_pol[current.index]=current;
       callbackFor();
    }, err => {
        if (err) console.error(err.message);

        async.forEachOf(phrase_pol, (value, key, callbackFor2) => {
            let current1 = {};

            current1 = value;
            if (current1.nature=="NOUN"){
                let sum_pos = 0;
                let sum_neu = 0;
                let sum_neg = 0;
                let nbr_adj = 0;
                async.forEachOf(current1.index_adj,(value, key, callbackFor3) => {
                    sum_pos = sum_pos + phrase_pol[value].pol.pos;
                    sum_neg = sum_neg + phrase_pol[value].pol.neg;
                    sum_pos = sum_neu + phrase_pol[value].pol.neu;
                    nbr_adj = nbr_adj + 1;
                    callbackFor3();
                }, err => {
                    if (err) console.error(err.message);
                    if (nbr_adj>0){
                        current1.pol.pos = +(sum_pos/nbr_adj).toFixed(2);;
                        current1.pol.neg = +(sum_neg/nbr_adj).toFixed(2);;
                        current1.pol.neutre = +(sum_neu/nbr_adj).toFixed(2);;
                    }
                    
                    phrase_pol[current1.index]=current1;
                    callbackFor2();
                });
            }
            else{
                phrase_pol[current1.index]=current1;
                callbackFor2();
            }


        }, err => {
            if (err) console.error(err.message);
            callback(phrase_pol);

        });
    });


}


function getVecteurPolariteMot (mot,lemme,callback){
    cache.getFromCache(mot, (find,data)=>{
        if (find){

            let vecteur = {};
            let total = data.pol_pos+data.pol_neutre+data.pol_neg;

            vecteur.pos = +(data.pol_pos/total).toFixed(2);
            vecteur.neutre = +(data.pol_neutre/total).toFixed(2);
            vecteur.neg = +(data.pol_neg/total).toFixed(2);
            callback(vecteur);
        }
        else{
            // get polarisation for the word
            getPolFromRezoDump(mot,(err,vect)=>{
                if(err==-1) {
                    // get polarisation from lem
                    if (lemme!="<unknown>"){
                        cache.getFromCache(lemme, (find,data)=>{
                            if (find){
                                let vecteur = {};
                                let total = data.pol_pos+data.pol_neutre+data.pol_neg;

                                vecteur.pos = +(data.pol_pos/total).toFixed(2);
                                vecteur.neutre = +(data.pol_neutre/total).toFixed(2);
                                vecteur.neg = +(data.pol_neg/total).toFixed(2);
                                callback(vecteur);
                            }
                            else{
                                getPolFromRezoDump(lemme,(err,vect_lem)=>{
                                    if(err==-1) {

                                        console.log("Polarisation par défaut");
                                        let vecteur = {};

                                        vecteur.pos = 0.20;
                                        vecteur.neutre = 0.60;
                                        vecteur.neg = 0.20;
                                        callback(vecteur);
                                    }
                                    else callback(vect_lem);
                                });
                            }
                        });
                    }
                    else{
                        console.log("Polarisation par défaut");
                        let vecteur = {};

                        vecteur.pos = 0.20;
                        vecteur.neutre = 0.60;
                        vecteur.neg = 0.20;
                        callback(vecteur);
                    }
                }
                else callback(vect);
            });
        }

    });

}

function getPolFromRezoDump(mot,callback){
    let code_pol = {
        pos : 223173,
        neutre : 241794,
        neg : 223172
    };
    rezo.makeGetRequestRezoDump(mot,36,"&relin=norelin",function(err, result){
        if (!err){
            var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var res = result.match(regex_rs);
            if (res != null){
                let vecteur = {};
                let tab_res;
                async.forEachOf(res, (value, key, callbackFor) => {
                    tab_res = value.split(";");
                    let pos_id = Number(tab_res[3]);
                    let poids=Number(tab_res[5]);

                    if (pos_id ===code_pol.neg)
                        vecteur.neg = poids;
                    if (pos_id===code_pol.pos) {
                        vecteur.pos = poids;
                    }
                    if (pos_id===code_pol.neutre) {
                        vecteur.neutre = poids;
                    }
                    callbackFor();
                }, resultat => {

                    vecteur.pos= (vecteur.pos==undefined)?0:vecteur.pos;
                    vecteur.neutre =(vecteur.neutre==undefined)?0:vecteur.neutre;
                    vecteur.neg =(vecteur.neg==undefined)?0:vecteur.neg;

                    let total = vecteur.pos+vecteur.neutre+vecteur.neg;
                    if (total == 0){
                        callback(-1);
                    }
                    else{
                        vecteur.pos = +(vecteur.pos/total).toFixed(2);
                        vecteur.neutre = +(vecteur.neutre/total).toFixed(2);
                        vecteur.neg = +(vecteur.neg/total).toFixed(2);

                        let data = {
                            id : Number(tab_res[2]),
                            mot : mot,
                            pol_pos : vecteur.pos,
                            pol_neutre : vecteur.neutre,
                            pol_neg : vecteur.neg,
                        };
                        cache.addToCache(data, ()=>{
                            callback(null,vecteur);
                        });
                    }

                });
            }
            else{
                callback(-1);
            }
        }
        else {
            callback(-1);
            console.log("Error : result request polarisation");
        }

    });
}

module.exports.getVecteurPolaritePhrase = getVecteurPolaritePhrase;
module.exports.getVecteurPolariteMot =getVecteurPolariteMot;

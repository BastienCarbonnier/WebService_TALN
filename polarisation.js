/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252'),
    rezo        = require('./request_rezo'),
    cache       = require('./cache/gestion_cache');

function getPolaritePhrase(phrase,callback){
    let phrase_pol = [];
    async.forEachOf(phrase, (value, key, callbackFor) => {
        let mot_pol = {};
        mot_pol = value;


        if (mot_pol.nature!="ADP" && mot_pol.nature!="DET"){
            getPolariteMot(value.mot,function(pol){
                mot_pol.pol = pol;
                phrase_pol[value.index]=mot_pol;
                callbackFor();
            });
        }
        else{
            mot_pol.pol = 0;
            phrase_pol[value.index]=mot_pol;
            callbackFor();
        }


    }, err => {
        if (err) console.error(err.message);
        propagerPolarite(phrase_pol, (phrase_propa) =>{
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
function propagerPolarite (tokens,callback){

    let phrase_pol = [];

    async.forEachOf(tokens, (value, key, callbackFor) => {
        let current = {};

        current = value;
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
    }, err => {
        if (err) console.error(err.message);

        async.forEachOf(phrase_pol, (value, key, callbackFor2) => {
            let current = {};

            current = value;
            if (current.nature=="NOUN"){
                let sum_pol=0;

                async.forEachOf(current.index_adj,(value, key, callbackFor3) => {
                    console.log("-------- phrase_pol[value]");
                    console.log(phrase_pol[value]);
                    sum_pol += phrase_pol[value].pol;
                    console.log(sum_pol);
                    callbackFor3();
                }, err => {
                    if (err) console.error(err.message);

                    console.log("-------- sum_pol");
                    console.log(sum_pol);

                    if (sum_pol<0 && current.pol <=0){
                        current.pol--;
                    }
                    else if (sum_pol>0 && current.pol >=0) {
                        current.pol++;
                    }
                    else if (sum_pol>0 && current.pol<0){
                        current.pol--;
                    }

                    phrase_pol[current.index]=current;
                    callbackFor2();
                });
                //let mean = sum_pol/current.index_adj.length;
            }
            else{
                phrase_pol[current.index]=current;
                callbackFor2();
            }


        }, err => {
            if (err) console.error(err.message);
            callback(phrase_pol);

        });
    });


}

function sum_vector(pol1,pol2){
    sum_pol = {};
    return {neg : pol1.neg+pol2.neg, neutre:pol1.neutre+pol2.neutre,pos:pol1.pos+pol2.pos};
}


function getVecteurPolariteMot (mot,callback){
    mot = "propreté";
    cache.getFromCache(mot, (find,data)=>{
        if (find){
            let vecteur = {};
            vecteur.pos = data.pol_pos;
            vecteur.neutre = data.pol_neutre;
            vecteur.neg = data.pol_neg;
            callback(vecteur);
        }
        else{
            getFromRezoDump(mot,(err,vect)=>{
                if(err==-1) console.log("Erreur lors de la reqûete");
                else callback(vect);
            });
        }

    });
}

function getFromRezoDump(mot,callback){
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
                    let data = {
                        id : Number(tab_res[2]),
                        mot : mot,
                        pos_tag : "",
                        pol_pos : vecteur.pos,
                        pol_neutre : vecteur.neutre,
                        pol_neg : vecteur.neg,
                    };
                    cache.addToCache(data, ()=>{
                        callback(null,vecteur);
                    });
                });
            }
            else{
                callback(-1);
            }
        }
        else {
            callback(-1);
            console.log("Error : result request");
        }

    });
}
function getPolariteMot (mot,callback){

    rezo.makeGetRequestRezoDump(mot,36,"&relin=norelin",function(err, result){

        if (!err){
            var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var rs = result.match(regex_rs);

            if (rs != null){
                //console.log(rs);

                rezo.findMaxPoidsRelSortante(rs ,function(pol_id) {
                    var regex = new RegExp("e;"+pol_id+";'.*';\\d*;\\d*","g");

                    var res = result.match(regex);
                    if (res != null){
                        var tab_res = res[0].split(";");
                        var ind_raf = tab_res[2].indexOf(">");
                        let pol_string;
                        if (ind_raf!=-1){
                            pol_string = tab_res[2].substring(1,ind_raf);
                        }
                        else{
                            pol_string = tab_res[2].substring(1,tab_res[2].length-1);
                        }
                        let pol = pol_string.substring(5,8);
                        if (pol ==="NEG")
                            callback(-1);
                        else if (pol==="POS") {
                            callback(1);
                        }
                        else {
                            callback(0);
                        }
                    }
                    else{
                        callback(-1);
                    }
                });
                //callback(null,n3_tab,w_tab,result);
            }
            else{
                //console.log("Error : result regex null");
                callback(-1);
            }

        }
        else {
            console.log("Error : result request");
            //callback(-1);
        }

    });



}

module.exports.getPolaritePhrase = getPolaritePhrase;
module.exports.getVecteurPolariteMot =getVecteurPolariteMot;

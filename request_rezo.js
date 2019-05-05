/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async   = require("async"),
rp          = require('request-promise'),
cheerio     = require('cheerio'),
windows1252 = require('windows-1252');




function findMaxPoidsRelSortante(data,callback){
    var max_poids =-1;
    var max_index =-1;
    for (var i in data){
        if(Number(data[i].poids)>Number(max_poids)){
            max_poids = Number(data[i].poids);
            max_index = Number(data[i].id);
        }
    }
    callback(max_index);
}

/*
Récupérer si le mot appartient à l'ontologie
*/

function getPosTagFromJDM(mot,callback){
    console.log("######### Dans get pos tag #######");
    console.log("Mot");
    console.log(mot);

    let jdm_spacy = {
        "Nom" : "NOUN",
        "Ver" : "VERB",
        "Adv" : "ADV",
        "Adj" : "ADJ"
    };
    getRelationsSortantes(mot,4,(err,rel_s,data)=>{
        if (err !=-1){
            findMaxPoidsRelSortante(rel_s,(max_index)=>{
                getWordByID(data,max_index,(word)=>{
                    callback(jdm_spacy[word.split(":")[0]]);
                });

            });
        }
        else {
            callback("X");
        }


    });

}
function getWordByID (data,w_id,callback){
    var regex = new RegExp("e;"+w_id+";'.*';\\d*;\\d*","g");
    var res = data.match(regex);
    if (res != null){
        var tab_res = res[0].split(";");
        var ind_raf = tab_res[2].indexOf(">");
        if (ind_raf!=-1){
            callback(tab_res[2].substring(1,ind_raf));
        }
        else{
            callback(tab_res[2].substring(1,tab_res[2].length-1));
        }

    }
    else{
        callback(-1);
    }

}
function getRelationsSortantes(fw,rel_id,callback){

    makeGetRequestRezoDump(fw,rel_id,"&relin=norelin",function(err, result){
        if (!err){

            var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var rs = result.match(regex_rs);
            //console.log(rs);
            var res_tab = [];
            if (rs != null){
                for (var i in rs){
                    var tab_rs = rs[i].split(";");
                    if (Number(tab_rs[5])>0){
                        res_tab.push({id : Number(tab_rs[3]), poids : Number(tab_rs[5])});
                    }
                }
                callback(null,res_tab,result);
            }
            else{
                callback(-1);
            }

        }
        else {
            callback(-1);
        }

    });
}
function makeGetRequestRezoDump (word,rel_id,param,callback){
    var url = windows1252.encode("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel="+word+"&rel="+rel_id+(param==null?"":param));
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

        var result = $('code').text();
        callback(null,result);
    })
    .catch((err) => {
        console.log(err);
        callback(err);
    });
}

module.exports.makeGetRequestRezoDump = makeGetRequestRezoDump;
module.exports.findMaxPoidsRelSortante =findMaxPoidsRelSortante;
module.exports.getPosTagFromJDM =getPosTagFromJDM;

/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252');




function findMaxPoidsRelSortante(data,callback){
    var max_poids =-1;
    var max_index =-1;
    for (var i in data){
        var line = data[i].split(";");
        if(Number(line[5])>Number(max_poids)){
            max_poids = Number(line[5]);
            max_index = Number(line[3]);
        }
    }
    callback(max_index);
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

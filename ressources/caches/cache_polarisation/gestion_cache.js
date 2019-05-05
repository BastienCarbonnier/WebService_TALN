/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

const async = require("async"),
fs = require('fs'),
path = require('path');


function addToCache(data, callback){

    let data_string = data.id+";"+
    data.mot + ";" +
    data.pol_pos + ";"+
    data.pol_neutre + ";"+
    data.pol_neg+"\n";

    fs.appendFile("./ressources/caches/cache_polarisation/cache.csv", data_string, (err) => {
        if (err) throw err;
        console.log('The word is saved in cache.csv');
        callback();
    });
}

function getFromCache(mot,callback){
    const filename = path.join(__dirname, 'cache.csv');
    let data;
    fs.readFile(filename, (err, content) => {
        let lines = String(content).split("\n").slice(1);
        let find = false;
        async.whilst(
            function() { return lines.length > 0 && !find; },
            function(callback1) {
                let elts = lines[0].split(";");

                if(elts[1]==mot){
                    data = {
                        id : Number(elts[0]),
                        pol_pos : Number(elts[2]),
                        pol_neutre : Number(elts[3]),
                        pol_neg :Number(elts[4])
                    };
                    find = true;
                    callback1(find);
                }
                else{
                    lines = lines.slice(1);
                    callback1(false);
                }

            },
            function (find) {
                callback(find,data);
            }
        );
    });
}


module.exports.getFromCache = getFromCache;
module.exports.addToCache = addToCache;

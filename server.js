/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

var express     = require('express'),
    async       = require("async"),
    rp          = require('request-promise'),
    cheerio     = require('cheerio'),
    windows1252 = require('windows-1252');

let {PythonShell} = require('python-shell');

const app = express();
const port = 3000;

app.get('/', (request, response) => {
    response.send('Hello from Express!');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    var options = {
        mode: 'json',
        scriptPath: '/Users/bca/Workspace/TER_M1_Hotel_Advisor/WebService_TALN/python/',
        args: []
    };

    options.args[0] = "La salle de bain était sale.";

    PythonShell.run('parse_sentence.py', options, function (err, results) {
        if (err) throw err;

        let phrase = JSON.parse(JSON.stringify(results[0]));
        console.log(phrase);

        for (let i in phrase) {
            if (phrase[i].type == "punct" || phrase[i].type == "det") {
                phrase.splice(i,i);
            }
        }


        console.log(phrase);

        getPolaritePhrase(phrase, function(phrase_pol){
            console.log(phrase_pol);
        });
        //console.log(results);
    //let essai = JSON.parse(JSON.stringify(results[0]));
    //console.log(essai);
    // rel 36 = r_infopot

    });

    /*
    getPolariteMot("propreté",function(pol){
        console.log("Polarité mot = "+pol);
    });
*/



console.log(`server is listening on ${port}`);
});

function getPolaritePhrase(phrase,callback){
    let phrase_pol = [];
    async.forEachOf(phrase, (value, key, callbackFor) => {
        let mot_pol = {};
        mot_pol.index = value.index;
        mot_pol.mot = value.mot;
        mot_pol.type = value.type;

        getPolariteMot(value.mot,function(pol){
            mot_pol.pol = pol;
            phrase_pol[value.index]=mot_pol;
            callbackFor();
        });

    }, err => {
        if (err) console.error(err.message);
        callback(phrase_pol);

    });
}

function getPolariteMot (mot,callback){

    makeGetRequestRezoDump(mot,36,"&relin=norelin",function(err, result){

        if (!err){
            var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var rs = result.match(regex_rs);

            if (rs != null){
                console.log(rs);
                findMaxPoidsRelSortante(rs ,function(pol_id) {
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
                console.log("Error : result regex null");
                //callback(-1);
            }

        }
        else {
            console.log("Error : result request");
            //callback(-1);
        }

    });



}

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

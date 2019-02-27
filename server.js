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

app.get('/', (req, res) => {
    var options = {
        mode: 'json',
        scriptPath: '/Users/bca/Workspace/TER_M1_Hotel_Advisor/WebService_TALN/python/',
        args: []
    };

    options.args[0] = req.query.phrase;
    //console.log(req.query.phrase);
    PythonShell.run('parse_sentence.py', options, function (err, results) {
        if (err) throw err;

        let phrase = JSON.parse(JSON.stringify(results[0]));

        /*
        for (let i in phrase) {
            if (phrase[i].type == "punct" || phrase[i].type == "det") {
                phrase.splice(i,i);
            }
        }
        */

        temp = [];

        for(let i of phrase)
            i && temp.push(i); // copy each non-empty value to the 'temp' array

        phrase = temp;

        getPolaritePhrase(phrase, function(phrase_pol){
            res.json(phrase_pol);
        });

    // rel 36 = r_infopot

    });

});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});

function getPolaritePhrase(phrase,callback){
    let phrase_pol = [];
    async.forEachOf(phrase, (value, key, callbackFor) => {
        let mot_pol = {};
        mot_pol.index = value.index;
        mot_pol.mot = value.mot;
        mot_pol.type = value.type;
        if (mot_pol.type == "NOUN"){
            mot_pol.index_adj=value.index_adj;
        }

        if (mot_pol.type!="ADP" && mot_pol.type!="DET"){
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
    console.log(tokens);
    async.forEachOf(tokens, (value, key, callbackFor) => {
        let current = {};
        current.index = value.index;
        current.mot = value.mot;
        current.type = value.type;
        current.pol = value.pol;
        if (current.type == "NOUN"){
            current.index_adj=value.index_adj;
        }

        let id_courant = current.index;
        let next_token = (current.index== tokens.length-1)?null:tokens[current.index+1];
        let prev_token = (current.index== 0)?null:tokens[current.index-1];
        if (current.type!="ADP" && current.type!="DET"){
            if(current.type=="ADJ"){
                if(next_token && next_token.type=="ADV"){
                    if (next_token.pol<0 && current.pol <=0){
                        current.pol--;
                    }
                    else if (next_token.pol>0 && current.pol >=0) {
                        current.pol++;
                    }
                    else if (next_token.pol>0 && current.pol<0){
                        current.pol--;
                    }
                }
                if(prev_token && prev_token.type=="ADV"){
                    if (prev_token.pol<0 && current.pol <=0){
                        current.pol--;
                    }
                    else if (prev_token.pol>0 && current.pol >=0){
                        current.pol++;
                    }
                    else if (prev_token.pol>0 && current.pol<0){
                        current.pol--;
                    }
                }
            }

            phrase_pol[current.index]=current;
            callbackFor();
        }
        else{
            phrase_pol[current.index]=current;
            callbackFor();
        }
    }, err => {
        if (err) console.error(err.message);

        async.forEachOf(phrase_pol, (value, key, callbackFor2) => {

                if (value.type=="NOUN"){
                    let sum_pol = 0;
                    for (let i in value.index_adj){
                        sum_pol+=phrase_pol[value.index_adj[i]].pol;
                    }
                    let mean = sum_pol/value.index_adj.length;
                    if(mean>0 && value.pol>=0)
                        value.pol++;
                    else if(mean<0 && value.pol<=0)
                        value.pol--;
                    else if(mean<0 && value.pol>=0)
                        value.pol--;
                    else if(mean>0 && value.pol0)
                        value.pol--;

                }
                phrase_pol[value.index]=value;
                callbackFor2();

        }, err => {
            if (err) console.error(err.message);
            callback(phrase_pol);

        });
    });


}

function getPolariteMot (mot,callback){

    makeGetRequestRezoDump(mot,36,"&relin=norelin",function(err, result){

        if (!err){
            var regex_rs = new RegExp("r;\\d*;\\d*;\\d*;\\d*;(-|)\\d*","g");
            var rs = result.match(regex_rs);

            if (rs != null){
                //console.log(rs);
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
                //console.log("Error : result regex null");
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

/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */

const express = require('express');
const app = express();
const port = 3000;
let {PythonShell} = require('python-shell');

app.get('/', (request, response) => {
    response.send('Hello from Express!');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    var options = {
        mode: 'json',
        pythonPath: '/Users/bca/Workspace/TER_M1_Hotel_Advisor/WebService_TALN/python/env/bin/python3.7',
        pythonOptions: ['-u'],
        // make sure you use an absolute path for scriptPath
        scriptPath: '/Users/bca/Workspace/TER_M1_Hotel_Advisor/WebService_TALN/python/',
        args: []
    };

    options.args[0] = "La chambre était très bruyante.";

    PythonShell.run('parse_sentence.py', options, function (err, results) {
        if (err) throw err;

        console.log(results);
        //let essai = JSON.parse(JSON.stringify(results[0]));
        //console.log(essai);

    });

    console.log(`server is listening on ${port}`);
});

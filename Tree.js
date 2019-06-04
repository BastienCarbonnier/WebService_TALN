/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */
var async = require("async");
function Node(text) {
    this.text = text;
    this.parent = null;
    this.children = [];
    this.isLeaf = false;
}
function Node(text,parent,isLeaf) {
    this.text = text;
    this.parent = parent;
    this.children = [];
    this.isLeaf = isLeaf;
}

function Tree(text) {
    var node = new Node(text);
    this._root = node;
}

Tree.prototype.contains = function(callback, traversal) {
    traversal.call(this, callback);
};

Tree.prototype.addWord = function(compound_word,callback) {
    let currentNode = this._root;

    let compound_word_tab = compound_word.split(" ");
    // Boucle sur chaque enfant du parent passé en paramètre
    async.forEachOf(compound_word_tab, (word, key, callbackFor) => {
        let indexNode = -1;

        async.forEachOf(currentNode.children, (value, key, callbackFor2) => {
            if (value.text == word)
                indexNode = key;
            callbackFor2(false);
        }, err => {
            if (err) console.error(err.message);
            if(indexNode == -1){
                let newNode = new Node(word,currentNode, (key==compound_word_tab.length-1));
                currentNode.children.push(newNode);
                currentNode = newNode;
                callbackFor(false);
            }
            else{
                if (key==compound_word_tab.length-1){
                    currentNode.children[indexNode].isLeaf = true;
                }
                currentNode =currentNode.children[indexNode];
                callbackFor(false);
            }
        });


    }, err => {
        if (err) console.error(err.message);
        callback();
    });
};


Tree.prototype.containsCompoundWord = function(words,callback) {

    let nbr_mot_init = words.length;

    let root = this._root;
    let currentTree = root;
    let endCW  = false;

    let i = 0;
    let n = 0;

    let find = false;
    let childrens = currentTree.children;
    let nbr_children = childrens.length;

    let max_cw = []; // Les mots composés les plus grands pour chaque index
    for (let p =0;p<words.length;p++)
        max_cw[p]=0;

    let size = 0; // Taille du mot composé


    // On prend et on supprime le premier mot de words
    let is_first_word = true;

    let currentWord = words[0].mot;
    let words_save;
    //words = words.slice(1);



    let findCW = false;
    async.whilst( // Tant que nous n'arrivons pas à la fin de la phrase
        function () { return  currentTree && !endCW ; },//check condition.
        function (callback1) {
            find = false;
            async.whilst( // Pour chaque enfant à moins que nous trouvions le mot
                function () { return  !find && i < nbr_children ; },//check condition.
                function (callback2) {
                    if(childrens[i].text == currentWord){
                        find = true;
                        callback2(null,true);
                    }
                    else{
                        i++;
                        find=false;
                        callback2(null,false);
                    }
                },
                function (err,findSon) {
                    is_first_word = false;
                    if(findSon){
                        size++;

                        if (words.length==0){ // On est à la fin de la phrase
                            endCW = true;
                            if (childrens[i].isLeaf){
                                let index = nbr_mot_init-words.length-size+1;
                                // On enregistre le mot composé
                                max_cw[(index>0)?index:0]= size;
                                //console.log(max_cw);
                                size=0;
                                findCW = true;
                                callback1(null,findCW,max_cw); // Mots composés présent dans l'arbre
                            }
                            else {
                                callback1(null,findCW,max_cw); // Mots composés non présent dans l'arbre
                            }
                        }
                        else{
                            // Si ce n'est pas la fin et que c'est une feuille
                            if (childrens[i].isLeaf){
                                //console.log("Je suis une feuille")
                                findCW = true;
                                let index = nbr_mot_init-words.length-size+1;
                                // On enregistre le mot composé
                                max_cw[(index>0)?index:0]= size;

                                if (words_save==undefined){
                                    words_save = words.slice();
                                    words = words.slice(1);
                                    currentWord = words[0].mot;
                                }
                                else{
                                    words = words_save.slice(1);
                                    currentWord = words[0].mot;
                                    words_save = undefined;
                                }


                            }
                            else{
                                if (words_save == undefined){
                                    words_save = words.slice();
                                }

                                if(is_first_word){
                                    currentWord = words[1].mot;
                                }


                                words = words.slice(1);
                                if(words.length>0)
                                    currentWord = words[0].mot;

                            }
                            endCW = false;
                            currentTree = childrens[i];
                            childrens = currentTree.children;
                            i=0;
                            nbr_children = childrens.length;
                            callback1(null,findCW,max_cw);
                        }
                    }
                    else{
                        if (words.length==0){
                            endCW = true;
                            callback1(null,findCW,max_cw);
                        }
                        else{

                            endCW =false;
                            if (words_save != undefined){
                                words = words_save.slice(1);
                                currentWord = words[0].mot;
                                words_save = undefined;

                            }
                            else{
                                currentWord = words[0].mot;
                                words_save = words;
                                words = words.slice(1);


                            }

                            size=0;
                            currentTree = root;
                            childrens = currentTree.children;
                            i=0;
                            nbr_children = childrens.length;
                            callback1(null,findCW,max_cw);
                        }

                    }
                }

            );

        },
        function (err,findWord,max_cw) { //final result
            if(findWord){
                callback(err,findWord,max_cw);
            }else{
                callback(err,findWord,max_cw);
            }
        }
    );
};

module.exports = Node;
module.exports = Tree;

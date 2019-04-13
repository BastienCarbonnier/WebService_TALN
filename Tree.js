/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */
var async       = require("async");
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

Tree.prototype.traverseDF = function(callback) {

    // this is a recurse and immediately-invoking function
    (function recurse(currentNode) {
        // step 2
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 3
            recurse(currentNode.children[i]);
        }

        // step 4
        callback(currentNode);

        // step 1
    })(this._root);

};

function Queue() {
  this.text = [];
}

Queue.prototype.enqueue = function(record) {
    this.text.unshift(record);
};
Queue.prototype.dequeue = function() {
    let last = this.text[this.text.length - 1];
    this.text.pop();
    return last;

};
Tree.prototype.traverseBF = function(callback) {
    var queue = new Queue();

    queue.enqueue(this._root);

    currentTree = queue.dequeue();
    while(currentTree){
        for (var i = 0, length = currentTree.children.length; i < length; i++) {
            queue.enqueue(currentTree.children[i]);
        }

        callback(currentTree);
        currentTree = queue.dequeue();
    }
};
Tree.prototype.contains = function(callback, traversal) {
    traversal.call(this, callback);
};

Tree.prototype.add = function(text, totext, traversal) {
    var child = new Node(text),
        parent = null,
        callback = function(node) {
            if (node.text === totext) {
                parent = node;
            }
        };

    this.contains(callback, traversal);

    if (parent) {
        parent.children.push(child);
        child.parent = parent;
    } else {
        throw new Error('Cannot add node to a non-existent parent.');
    }
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
                        console.log("Fils trouvé : " + childrens[i].text+" "+currentWord);
                        find = true;
                        callback2(null,true);
                    }
                    else{
                        console.log("Fils non trouvé : " + childrens[i].text+" "+currentWord);
                        i++;
                        find=false;
                        callback2(null,false);
                    }
                },
                function (err,findSon) {
                    if(findSon){
                        size++;

                        if (words.length==0){ // On est à la fin de la phrase
                            endCW = true;
                            if (childrens[i].isLeaf){
                                // On enregistre le mot composé
                                max_cw[nbr_mot_init-words.length-size]= size;
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
                                // On enregistre le mot composé
                                max_cw[nbr_mot_init-words.length-size]= size;

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
                                //console.log("Je ne suis pas une feuille")
                                //console.log(childrens[i]);
                                if (words_save == undefined){
                                    words_save = words.slice();
                                }
                                currentWord = words[0].mot;

                                words = words.slice(1);

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
                                words_save = undefined;
                                currentWord = words[0].mot;
                            }
                            else{
                                currentWord = words[0].mot;
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
                console.log("On a trouvé au moins 1 mot composé");
                callback(err,findWord,max_cw);
            }else{
                console.log("Aucun mot composé n'a été trouvé");
                callback(err,findWord,max_cw);
            }
        }
    );
};
Tree.prototype.remove = function(text, fromtext, traversal) {
    var tree = this,
        parent = null,
        childToRemove = null,
        index;

    var callback = function(node) {
        if (node.text === fromtext) {
            parent = node;
        }
    };

    this.contains(callback, traversal);

    if (parent) {
        index = findIndex(parent.children, text);

        if (index === undefined) {
            throw new Error('Node to remove does not exist.');
        } else {
            childToRemove = parent.children.splice(index, 1);
        }
    } else {
        throw new Error('Parent does not exist.');
    }

    return childToRemove;
};

module.exports = Node;
module.exports = Tree;

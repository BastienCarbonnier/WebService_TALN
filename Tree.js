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
                currentNode = currentNode.children[indexNode];
                callbackFor(false);
            }
        });


    }, err => {
        if (err) console.error(err.message);
        callback();
    });
};

Tree.prototype.containsCompoundWord = function(compound_word,callback) {

    let words = compound_word.split(" ");

    // On prend et on supprime le premier mot de words
    let currentWord = words[0];
    words = words.slice(1);

    let currentTree = this._root;
    endCW  = false;
    let nbr_children = currentTree.children.length;
    let i = 0;
    let cpt = 0;
    let find = false;
    let childrens = currentTree.children;

    async.whilst( // Tant que nous n'arivons pas à la fin du mots composé ou si il n'est pas dans l'arbre
        function () { return  currentTree && !endCW; },//check condition.
        function (callback1) {
            find = false;
            async.whilst( // Pour chaque enfant àmoins que nous trouvons le mot
                function () { return  !find && i < nbr_children; },//check condition.
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
                function (err,findWord) { //final result
                    if(findWord){
                        if (words.length==0){
                            endCW = true;
                            if (childrens[i].isLeaf){
                                callback1(null,true); // Mots composés présent dans l'arbre
                            }
                            else {
                                callback1(null,false); // Mots composés non présent dans l'arbre
                            }
                        }
                        else{
                            endCW = false;
                            currentWord = words[0];
                            words = words.slice(1);
                            currentTree = childrens[i];
                            childrens = childrens[i].children;
                            i=0;
                            nbr_children = childrens.length;
                            callback1(null,null);
                        }
                    }
                    else{
                        endCW = true;
                        callback1(null,false);
                    }
                }
            );

        },
        function (err,findWord) { //final result
            if(findWord){
                console.log("Mot composé trouvé");
                callback(err,findWord);
            }else{
                console.log("Mot composé non trouvé");
                callback(err,findWord);
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

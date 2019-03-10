/*jslint node: true */
/*jshint esversion: 6 */
/* jshint expr: true */
var async       = require("async");
function Node(text) {
    this.text = text;
    this.parent = null;
    this.children = [];
}
function Node(text,parent) {
    this.text = text;
    this.parent = parent;
    this.children = [];
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

Tree.prototype.addWord = function(word,callback) {
    let currentNode = this._root;
    // Boucle sur chaque enfant du parent passé en paramètre
    async.forEachOf(word, (letter, key, callbackFor) => {
        let indexNode = -1;
        async.forEachOf(currentNode.children, (value, key, callbackFor2) => {
            if (value.text == letter)
                indexNode = key;
            callbackFor2(false);
        }, err => {
            if (err) console.error(err.message);
            if(indexNode == -1){
                let newNode = new Node(letter,currentNode);
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

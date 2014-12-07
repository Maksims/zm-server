var Obj = require('./obj');


function Tree(client) {
    Obj.call(this, 'tree');
    this.radius = .25;
    this.static = true;
}
Tree.prototype = Object.create(Obj.prototype);


module.exports = Tree;

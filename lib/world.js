var Events = require('./events');
var id = require('./id');
require('./tree');

function World() {
    Events.call(this);
    this.id = id.make();
    this.width = 16;
    this.height = 8;
    this.objects = { };

    this.nodes = [ ];
    this.nodeSize = 2;
    this.nodesX = Math.floor(this.width / this.nodeSize);
    this.nodesY = Math.floor(this.height / this.nodeSize);

    for(var y = 0; y < this.nodesY; y++) {
        for(var x = 0; x < this.nodesX; x++) {
            this.nodes.push([ ]);
        }
    }
}
World.prototype = Object.create(Events.prototype);


World.prototype.nodeByXY = function(x, y) {
    x = Math.max(0, Math.min(this.nodesX - 1, Math.floor(x / this.nodeSize)));
    y = Math.max(0, Math.min(this.nodesY - 1, Math.floor(y / this.nodeSize)));
    return Math.floor(y * this.nodesX + x);
};

World.prototype.nodesAround = function(ind, range) {
    var ny = Math.floor(ind / this.nodesX);
    var nx = ind - ny * this.nodesX;
    range = range || 1;

    var nodes = [ ];
    for(var y = Math.max(0, ny - range); y < Math.min(this.nodesY, ny + range + 1); y++) {
        for(var x = Math.max(0, nx - range); x < Math.min(this.nodesX, nx + range + 1); x++) {
            nodes.push(this.nodes[Math.floor(y * this.nodesX + x)]);
        }
    }
    return nodes;
};

World.prototype.add = function(obj) {
    if (this.objects[obj.id]) return;

    var node = this.nodeByXY(obj.pos[0], obj.pos[1]);
    if (! this.nodes[node]) return;
    this.nodes[node].push(obj);
    obj.node = node;

    this.objects[obj.id] = obj;

    publish(obj.type + ':add', obj.data());
};


World.prototype.remove = function(obj) {
    if (! this.objects[obj.id]) return;

    this.nodes[obj.node].splice(this.nodes[obj.node].indexOf(obj), 1);

    delete this.objects[obj.id];
    publish(obj.type + ':remove', {
        id: obj.id
    });
};


World.prototype.data = function() {
    var data = {
        width: this.width,
        height: this.height,
        nodeSize: this.nodeSize,
        objects: [ ]
    };
    for(var id in this.objects) {
        data.objects.push(this.objects[id].data());
    }
    return data;
};


World.prototype.delta = function() {
    var data = [ ];
    for(var id in this.objects) {
        if (! this.objects[id].dirty) continue;
        data.push(this.objects[id].delta());
    }
    if (! data.length) return null;
    return data;
};


global.world = new World();

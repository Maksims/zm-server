var Events = require('./events');
var id = require('./id');
require('./vec2');


function Obj(type) {
    Events.call(this);
    this.id = id.make();
    this.type = type;
    this.pos = Vec2.new();
    this.radius = 0;
    this.dirty = false;
    this.node = null;
}
Obj.prototype = Object.create(Events.prototype);

Obj.prototype.data = function() {
    var obj = {
        id: this.id,
        type: this.type,
        pos: [ parseFloat(this.pos[0].toFixed(3), 10), parseFloat(this.pos[1].toFixed(3), 10) ],
        radius: this.radius
    };

    return obj;
};

Obj.prototype.delta = function() {
    if (! this.dirty) return;
    this.dirty = false;

    var obj = {
        id: this.id,
        pos: [ parseFloat(this.pos[0].toFixed(3), 10), parseFloat(this.pos[1].toFixed(3), 10) ]
    };

    return obj;
};

Obj.prototype.collision = function(dist, obj) {
    if (! this.static && obj.radius && dist < (this.radius + obj.radius) && ! obj.dead && ! this.dead) {
        Vec2.a.set(this.pos).sub(obj.pos).norm();
        var o = (this.radius + obj.radius) - dist;
        if (obj.static) {
            this.pos.add(Vec2.b.set(Vec2.a).norm().mulS(o));
            this.pos[0] = Math.max(0, Math.min(world.width - .01, this.pos[0]));
            this.pos[1] = Math.max(0, Math.min(world.height - .01, this.pos[1]));

            this.dirty = true;
        } else {
            this.pos.add(Vec2.b.set(Vec2.a).norm().mulS(o * .5));
            obj.pos.add(Vec2.b.set(Vec2.a).norm().mulS(-o * .5));

            this.pos[0] = Math.max(0, Math.min(world.width - .01, this.pos[0]));
            this.pos[1] = Math.max(0, Math.min(world.height - .01, this.pos[1]));

            obj.pos[0] = Math.max(0, Math.min(world.width - .01, obj.pos[0]));
            obj.pos[1] = Math.max(0, Math.min(world.height - .01, obj.pos[1]));

            this.dirty = true;
            obj.dirty = true;
        }
        return true;
    }
};


module.exports = Obj;

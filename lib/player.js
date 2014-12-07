var Obj = require('./obj');


function Player(client) {
    Obj.call(this, 'player');
    this.owner = client;
    this.move = Vec2.new();
    this.radius = .125;
    this.speed = .05;
    this.hp = 100;
    this.respawn = false;
    this.dead = false;
    this.died = 0;
}
Player.prototype = Object.create(Obj.prototype);


Player.prototype.update = function() {
    if (this.move.len() > 0 && ! this.dead) {
        this.pos.sub(Vec2.a.set(this.move).mulS(this.speed));
        this.pos[0] = Math.max(0, Math.min(world.width - .01, this.pos[0]));
        this.pos[1] = Math.max(0, Math.min(world.height - .01, this.pos[1]));
        this.dirty = true;
    }

    if (this.dead && (Date.now() - this.died) > 1000) {
        this.dead = false;
        this._hp = 100;
        this.pos.setXY(world.width * Math.random(), world.height * Math.random());
        this.dirty = true;
    }

    if (! this.dead) {
        var nodesAround = world.nodesAround(this.node);
        for(var n = 0; n < nodesAround.length; n++) {
            for(var o = 0; o < nodesAround[n].length; o++) {
                var obj = nodesAround[n][o];
                if (obj && obj !== this) {
                    var d = this.pos.dist(obj.pos);
                    this.collision(d, obj);
                }
            }
        }
    }
};


Player.prototype.data = function() {
    var data = Obj.prototype.data.call(this);
    data.owner = this.owner && this.owner.id || 0;
    data.hp = this.hp;
    data.dead = this.dead;
    return data;
};


Player.prototype.delta = function() {
    var data = Obj.prototype.delta.call(this);
    if (! data) return;
    data.hp = this.hp;
    if (this.dead) {
        data.dead = true;
    }
    return data;
};


Object.defineProperty(Player.prototype, 'hp', {
    set: function(hp) {
        this._hp = hp;
        this.dirty = true;
        if (this._hp <= 0) {
            this._hp = 0;
            this.dead = true;
            this.died = Date.now();
            this.emit('dead');
        }
    },
    get: function() {
        return this._hp;
    }
})


module.exports = Player;

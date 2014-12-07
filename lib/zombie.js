var Obj = require('./obj');


function Zombie(client) {
    Obj.call(this, 'zombie');
    this.owner = client;
    this.move = Vec2.new();
    this.speed = .03;
    this.target = Vec2.new();
    this.follow = null;
    this.range = 2;
    this.wait = 0;
    this.radius = .125;
    this.attacked = Date.now();
    this.attack = false;
    this.hp = 20;

    this._onHuntDead = function() {
        this.follow = null;
        this.target.set(this.pos);
    }.bind(this);
}
Zombie.prototype = Object.create(Obj.prototype);


Zombie.prototype.update = function() {
    this.wait--;

    var nodesAround = world.nodesAround(this.node);
    for(var n = 0; n < nodesAround.length; n++) {
        for(var o = 0; o < nodesAround[n].length; o++) {
            var obj = nodesAround[n][o];
            if (obj && obj !== this) {
                var d = this.pos.dist(obj.pos);
                if (this.collision(d, obj)) {
                    this.target.set(this.pos);
                }

                if (this.wait <= 0 && obj.type === 'player' && ! obj.dead && d < this.range && this.target.dist(this.pos) <= this.speed && ! this.follow) {
                    this.follow = obj;
                    this.follow.once('dead', this._onHuntDead);
                    this.target.set(this.follow.pos);
                }
            }
        }
    }

    if (this.wait <= 0 && this.target.dist(this.pos) <= this.speed) {
        if (this.follow) {
            this.follow.unbind('dead', this._onHuntDead);
            this.follow = null;
            this.wait = Math.floor(Math.random() * 40);
        }
        if (! this.follow) {
            this.target.setXY(this.pos[0] + Math.random()*2-1, this.pos[1] + Math.random()*2-1);
        }
    }

    if (this.follow) {
        this.target.set(this.follow.pos);

        if (this.follow.pos.dist(this.pos) < (this.radius + this.follow.radius + 0.1) && Date.now() - this.attacked > 1000) {
            this.attacked = Date.now();
            this.attack = true;
            this.follow.hp -= Math.floor(Math.random() * 20) + 10;
        }

        if (this.follow && this.follow.pos.dist(this.pos) > this.range) {
            this.follow.unbind('dead', this._onHuntDead);
            this.follow = null;
            this.wait = Math.floor(Math.random() * 40);
        }
    }

    if (this.target.dist(this.pos) > this.speed) {
        this.target[0] = Math.max(0, Math.min(world.width, this.target[0]));
        this.target[1] = Math.max(0, Math.min(world.height, this.target[1]));
        this.move.set(this.pos).sub(this.target).norm();
        this.wait = Math.floor(Math.random() * 40);
    } else {
        this.move.setXY(0, 0);
    }

    if (this.move.len() > 0) {
        this.pos.sub(Vec2.a.set(this.move).mulS(this.speed));
        this.pos[0] = Math.max(0, Math.min(world.width - .01, this.pos[0]));
        this.pos[1] = Math.max(0, Math.min(world.height - .01, this.pos[1]));
        this.dirty = true;
    }
};


Zombie.prototype.data = function() {
    var obj = Obj.prototype.data.call(this);
    obj.hp = this.hp;
    return obj;
}


Zombie.prototype.delta = function() {
    if (! this.dirty) return;
    this.dirty = false;

    var obj = {
        id: this.id,
        pos: [ parseFloat(this.pos[0].toFixed(3), 10), parseFloat(this.pos[1].toFixed(3), 10) ],
        hp: this.hp
    };

    if (this.attack) {
        this.attack = false;
        obj.attack = true;
    }

    return obj;
};


global.Zombie = Zombie;

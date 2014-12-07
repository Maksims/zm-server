var Client = require('./client');
var Player = require('./player');
var Zombie = require('./zombie');
var Tree = require('./tree');

global.clients = { };
global.players = { };


global.publish = function(name, data, except) {
    var raw = name;
    if (typeof(data) === 'object') {
        raw = JSON.stringify({
            name: name,
            data: data
        });
    }
    for(var id in clients) {
        if (except && (clients[id].id === except || ((except instanceof Array) && except.indexOf(clients[id].id) !== -1)))
            continue;

        clients[id].send(raw);
    }
};


for(var i = 0; i < 32; i++) {
    var tree = new Tree();
    tree.pos.setXY(Math.random() * world.width, Math.random() * world.height);
    world.add(tree);
}


for(var i = 0; i < 128; i++) {
    var zombie = new Zombie();
    zombie.pos.setXY(Math.random() * world.width, Math.random() * world.height);
    // zombie.pos.setXY(1, 1);
    zombie.target.set(zombie.pos);
    world.add(zombie);
}


// for(var i = 0; i < 32; i++) {
//     var player = new Player();
//     player.pos.setXY(Math.random() * world.width, Math.random() * world.height);
//     player.move.setXY(Math.random() * 2 - 1, Math.random() * 2 - 1).norm();
//     world.add(player);
// }


Server.on('connection', function (socket) {
    var client = new Client(socket);
    clients[client.id] = client;
    console.log('[' + client.id + '] connected');

    // disconnect
    client.on('close', function() {
        console.log('[' + client.id + '] disconnected');
        delete clients[this.id];
        // publish
        publish('user:remove', {
            id: client.id
        });
    });

    // welcome
    client.send('welcome', {
        id: client.id
    });

    // send world data
    client.send('world:data', world.data());

    // player
    var player = new Player(client);
    // spawn in random position
    player.pos.setXY(Math.random() * world.width, Math.random() * world.height);
    // attach to client
    client.player = player;
    // add to world
    world.add(player);
    // add to players
    players[player.id] = player;
    // remove on disconnect
    client.on('close', function() {
        world.remove(player);
        delete players[player.id];
    });

    // TEMP
    // client.send('test', {
    //     number: 8,
    //     text: 'мудель',
    //     array: [ 32, 64, 1024 ],
    //     float: 32.64,
    //     object: {
    //         of: 'objects',
    //         or: 10,
    //         anyOtherData: [ 'a', 'b', 'c' ]
    //     }
    // });

    // TEMP
    client.on('message', function(name, data) {
        // console.log('[' + client.id + '] rcv: ' + name);
        // console.log(data);
    });

    // publish
    publish('user:add', {
        id: client.id
    }, client.id);

    // movement
    client.on('move', function(data) {
        if (typeof(data.x) == 'number' && typeof(data.y) == 'number') {
            if (data.x === 0 && data.y === 0) {
                client.player.move.setXY(0, 0);
            } else {
                client.player.move.setXY(data.x, data.y).norm();
            }
        } else {
            console.log('move: bad data');
        }
    });
});

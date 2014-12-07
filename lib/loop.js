var ups = 20;

var loop = function() {
    setTimeout(loop, 1000 / ups);

    // console.time("loop");

    for(var id in world.objects) {
        var obj = world.objects[id];
        if (! obj.update) continue;
        obj.update();

        // move between nodes
        var node = world.nodeByXY(obj.pos[0], obj.pos[1]);
        if (node !== obj.node && world.nodes[node]) {
            world.nodes[obj.node].splice(world.nodes[obj.node].indexOf(obj), 1);
            world.nodes[node].push(obj);
            obj.node = node;
        }
    }

    var data = { };

    var delta = world.delta();
    if (delta) data.delta = delta;

    publish('world:delta', data);

    // console.timeEnd("loop");
};

setTimeout(loop, 1000 / ups);

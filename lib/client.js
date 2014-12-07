var id = require('./id');
var Events = require('./events');

var reserved = [ 'disconnect', 'error', 'message' ];


function Client(socket) {
    Events.call(this);
    this.id = id.make();
    this.socket = socket;
    this.latency = -1;
    this.connected = true;

    this.socket.on('close', this.close.bind(this));
    this.socket.on('message', this._onMessage.bind(this));
    this._onSend = this._onSend.bind(this);
}
Client.prototype = Object.create(Events.prototype);


Client.prototype.close = function() {
    if (! this.connected) return;
    this.connected = false;
    this.socket.close();
    this.emit('close');
}

Client.prototype.send = function(raw, data) {
    if (! this.connected) return;
    if (data) {
        raw = JSON.stringify({
            name: raw,
            data: data
        });
    }
    // console.log('[' + this.id + '] snd: ' + raw);
    this.socket.send(raw, this._onSend);
};


Client.prototype._onSend = function(err) {
    if (! err) return;
    console.log(err);
    this.close();
};


Client.prototype._onMessage = function(raw) {
    var data;
    try {
        data = JSON.parse(raw);

        if (! data.name) {
            throw new Error('message: missing "name"');
        } if (typeof(data.name) !== 'string') {
            throw new Error('message: "name" should be a string');
        } else if (reserved.indexOf(data.name) !== -1) {
            throw new Error('message: "name" cannot be "' + data.name + '"');
        } if (! data.data) {
            throw new Error('message: missing "data"');
        } else if (typeof(data.data) !== 'object' || data.data instanceof Array) {
            throw new Error('message: "data" should be an object');
        }

        this.emit(data.name, data.data);
        this.emit('message', data.name, data.data);
    } catch(ex) {
        console.log(ex.message);
        console.log(raw);
    }
};


module.exports = Client;

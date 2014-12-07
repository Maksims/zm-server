"use strict";

function Events() {
    // _world
    Object.defineProperty(
        this,
        '_events', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: { }
        }
    );
}

Events.prototype.on = function(name, fn) {
    var events = this._events[name];
    if (events == undefined) {
        this._events[name] = [ fn ];
        this.emit('event:on', fn);
    } else {
        if (events.indexOf(fn) == -1) {
            events.push(fn);
            this.emit('event:on', fn);
        }
    }
    return this;
};

Events.prototype.once = function(name, fn) {
    var events = this._events[name];
    fn.once = true;
    if (!events) {
        this._events[name] = [ fn ];
        this.emit('event:once', fn);
    } else {
        if (events.indexOf(fn) == -1) {
            events.push(fn);
            this.emit('event:once', fn);
        }
    }
    return this;
};

Events.prototype.emit = function(name) {
    var events = this._events[name];
    if (events) {
        var i = events.length;
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) {
            if (events[i]) {
                events[i].apply(this, args);
                if (events[i].once) {
                    delete events[i];
                }
            }
        }
    }
    return this;
};

Events.prototype.unbind = function(name, fn) {
    if (name) {
        var events = this._events[name];
        if (events) {
            if (fn) {
                var i = events.indexOf(fn);
                if (i != -1) {
                    delete events[i];
                }
            } else {
                delete this._events[name];
            }
        }
    } else {
        delete this._events;
        this._events = { };
    }
    return this;
}

module.exports = Events;

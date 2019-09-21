const map = new WeakMap();

module.exports = function PromiseEmitter() {
    this._promise_listeners = {};
};

module.exports.extend = (cls) => {

    cls.prototype.whence = function(event) {
        return this._promise_listeners[event] = (this._promise_listeners[event] || new Promise((res) => this.once(event, () => {
            delete this._promise_listeners[event];
            res();
        })));
    };

};


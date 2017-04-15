const map = new WeakMap();

module.exports = function PromisedEmitter() {
    map.set(this, {});
    this.whence = function(event) {
        return (map.get(this)[event] = map.get(this)[event] || new Promise((res) => {
            this.once(event, res);
        }));
    };
};

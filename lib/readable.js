const {Readable} = require('stream');
const PromisedEmitter = require('./promised-events');

// TODO: build already resolved promise objects as you go.
const readImplementation = function readImplementation(size) {
    Promise.resolve(size)
        .then(this._promisedRead)
        .then((read) => this.push(read))
        .catch((e) => this.emit("error", e));
};

class PromisedReadable extends Readable {

    constructor(options) {

        super(Object.assign({}, options, {read: readImplementation}));

        PromisedEmitter.call(this);

        const read = options.read || this.constructor.prototype._read !== PromisedReadable.prototype._read && this.constructor.prototype._read;
        this._promisedRead = read.bind(this);

    }

    whenRead(...args) {
        const read = Readable.prototype.read(...args);
        if (read === null) {
            return new Promise((res) => {
                this.once("readable", () => {
                    res(this.read(...args));
                });
            });
        } else {
            return Promise.resolve(read);
        }
    }

}

const realHasInstance = Function.prototype[Symbol.hasInstance];
Object.defineProperty(PromisedReadable, Symbol.hasInstance, {
    value: function(object) {
        if (realHasInstance.call(this, object))
            return true;

        return object && object._read === readImplementation;
    }
});

module.exports = {PromisedReadable, readImplementation};

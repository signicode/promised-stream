const {Readable} = require('stream');
const PromisedEmitter = require('./promised-events');

// TODO: build already resolved promise objects as you go.
const readImplementation = function(size) {
    Promise.resolve(size)
        .then(this._promisedRead)
        .then((read) => this.push(read))
        .catch((e) => this.emit("error", e));
};

class PromisedReadable extends Readable {

    constructor(options) {

        super(Object.assign({}, options, {read: readImplementation}));

        PromisedEmitter.call(this);

        const read = options.read || this.constructor._read !== PromisedReadable.prototype._read && this.constructor._read;
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

module.exports = PromisedReadable;

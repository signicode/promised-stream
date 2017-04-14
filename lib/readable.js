const {Readable} = require('stream');

// TODO: build already resolved promise objects as you go.
const readImplementation = function(size) {
    Promise.resolve(size)
        .then(this._promisedRead)
        .then((read) => this.push(read))
        .catch((e) => this.emit("error", e));
};

class PromisedReadable extends Readable {

    constructor(options) {
        const read = options.read || this._read !== PromisedReadable.prototype._read && this._read;

        super(Object.assign({}, options, {read: readImplementation}));
        this._promisedRead = read.bind(this);
    }

}

module.exports = PromisedReadable;

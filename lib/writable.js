const {Writable} = require('stream');

const writeImplementation = function(chunk, encoding, callback) {
    Promise.resolve({chunk, encoding})
        .then(this._promisedWrite)
        .then(() => callback())
        .catch((e) => this.emit("error", e))
    ;
};

const writevImplementation = function(chunks, callback) {
    (
        this._promisedWritev ?
            Promise.resolve(chunks).then(this._promisedWritev) :
            Promise.all(chunks.map((chunkEntry) => Promise.resolve(chunkEntry).then(this._promisedWrite)))
    )
        .then(() => callback())
        .catch((e) => this.emit("error", e))
    ;
};

class PromisedWritable extends Writable {

    constructor(options) {

        super(Object.assign({}, options, {write: writeImplementation, writev: writevImplementation}));

        const write = options.write || this.constructor._write !== PromisedWritable.prototype._write && this.constructor._write;
        const writev = options.writev || this.constructor._writev !== PromisedWritable.prototype._writev && this.constructor._writev;

        this._promisedWrite = write.bind(this);
        this._promisedWritev = writev && writev.bind(this);
    }

}

module.exports = PromisedWritable;

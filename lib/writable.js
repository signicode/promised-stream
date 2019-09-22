const {Writable} = require("stream");
const PromisedEmitter = require("./promised-events");

const resolved = Promise.resolve();

const writeImplementation = function writeImplementation(chunk, encoding, callback) {
    Promise.resolve({chunk, encoding})
        .then(this._promisedWrite)
        .then(() => callback())
        .catch((e) => this.emit("error", e))
    ;
};

const writevImplementation = function writevImplementation(chunks, callback) {
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

        super(Object.assign({}, options, {
            write: writeImplementation, 
            writev: writevImplementation
        }));

        PromisedEmitter.call(this);

        const write = options.write || this.constructor.prototype._write !== PromisedWritable.prototype._write && this.constructor.prototype._write;
        const writev = options.writev || this.constructor.prototype._writev !== PromisedWritable.prototype._writev && this.constructor.prototype._writev;

        this._promisedWrite = write.bind(this);
        this._promisedWritev = writev && writev.bind(this);
    }

    whenWrote(...args) {
        return this.write(...args) ? resolved : this.whence("drain");
    }

}

const realHasInstance = Function.prototype[Symbol.hasInstance];
Object.defineProperty(PromisedWritable, Symbol.hasInstance, {
    value: function(object) {
        if (realHasInstance.call(this, object))
            return true;

        return object && object._write === writeImplementation;
    }
});


module.exports = {PromisedWritable, writeImplementation, writevImplementation};

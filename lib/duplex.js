const {Duplex} = require("stream");
const PromisedEmitter = require("./promised-events");

class PromisedDuplex extends Duplex {

    constructor(options) {
        super(Object.assign({}, options, {write: writeImplementation, writev: writevImplementation, read: readImplementation}));

        PromisedEmitter.call(this);

        const read = options.read || this.constructor.prototype._read !== PromisedDuplex.prototype._read && this.constructor.prototype._read;
        const write = options.write || this.constructor.prototype._write !== PromisedDuplex.prototype._write && this.constructor.prototype._write;
        const writev = options.writev || this.constructor.prototype._writev !== PromisedDuplex.prototype._writev && this.constructor.prototype._writev;

        this._promisedRead = read.bind(this);
        this._promisedWrite = write.bind(this);
        this._promisedWritev = writev && writev.bind(this);

        if (!options.allowHalfOpen) {
            this.on("end", () => this.end());
        }
    }

}

module.exports = {PromisedDuplex};

// Late definition of dependent methods is needed to keep parasitical inheritance
/* jshint latedef:false */
var {PromisedWritable, writeImplementation, writevImplementation} = require("./writable");
var {PromisedReadable, readImplementation} = require("./readable");
/* jshint latedef:true */

PromisedDuplex.prototype.whenRead = PromisedReadable.prototype.whenRead;
PromisedDuplex.prototype.whenWrote = PromisedWritable.prototype.whenWrote;

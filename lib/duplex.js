const PromisedReadable = require("./promised-readable");
const PromisedWritable = require("./promised-writable");

module.exports = class PromisedDuplex extends PromisedReadable {

    constructor(options) {
        super(Object.assign({}, options, {objectMode: options.objectMode || options.readableObjectMode}));

        PromisedWritable.call(
            this,
            Object.assign({}, options, {objectMode: options.objectMode || options.writableObjectMode})
        );

        if (!options.allowHalfOpen) {
            this.on("end", () => this.end());
        }
    }

    static [Symbol.hasInstance](instance) {
        return instance instanceof PromisedReadable &&
            instance instanceof PromisedWritable &&
            instance instanceof PromisedDuplex
        ;
    }

};

Object.assign(module.exports, PromisedWritable.prototype);

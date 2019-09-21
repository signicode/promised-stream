module.exports = {
    get PromisedReadable() { return require("./lib/readable").PromisedReadable; },
    get PromisedWritable() { return require("./lib/writable").PromisedWritable; },
    get PromisedDuplex() { return require("./lib/duplex").PromisedDuplex; },
    get PromisedTransform() { return require("./lib/transform").PromisedTransform; },
};

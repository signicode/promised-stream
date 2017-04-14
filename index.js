module.exports = {
    get PromisedReadable() { return require('./lib/readable'); },
    get PromisedWritable() { return require('./lib/writable'); },
    get PromisedDuplex() { return require('./lib/duplex'); },
    get PromisedTranform() { return require('./lib/transform'); },
};

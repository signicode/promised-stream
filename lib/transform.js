const { Transform } = require("stream");
// const assert = require("assert");

function transformImplementation(chunk, encoding) {
    let res = Promise.resolve(chunk);
    let lastChunk = chunk;

    for (const [transform, handler] of this._transforms) {
        if (transform) res = res.then(transformedChunk => transform.call(this, lastChunk = transformedChunk, encoding));
        else res = res.catch(e => handler.call(this, e, lastChunk, chunk));
    }
    return res;
}

const asapTransformImplementation = (maxParallel) => {
    let count = 0;
    let callbackQueue = [];

    return function asapTransformImplementation(chunk, encoding, callback) {
        if (count++ < maxParallel) {
            callback();
        } else {
            callbackQueue.push(callback);
        }

        return transformImplementation
            .call(this, chunk, encoding)
            .then(read => {
                for (let result of read) {
                    this.push(result, this._options.encoding);
                }
                count--;
                const callback = callbackQueue.shift();
                if (callback) callback();
            })
            .catch((e) => this.raise(e))
        ;
    };
};

const fifoTransformImplementation = (maxParallel) => {
    const keep = [];
    let previousTransform = Promise.resolve();

    const keepBackPressure = (curr) => {
        return Promise
            .all(curr, keep[keep.length - maxParallel])
            .then(([x]) => (keep.shift(), x));
    };

    return function fifoTransformImplementation(chunk, encoding, callback) {
        if (keep.length < maxParallel) {
            callback();
        } else {
            keep[keep.length - maxParallel].then(() => callback());
        }

        const curr = Promise
            .all(transformImplementation.call(this, chunk, encoding), previousTransform)
            .then(([res]) => res);
        keep.push(previousTransform = curr);
        
        return keepBackPressure(curr)
            .then(read => {
                for (let result of read) {
                    this.push(result, this._options.encoding);
                }
            })
            .catch((e) => this.raise(e))
        ;
    };
};

class PromisedTransform extends Transform {

    constructor({followOrder, maxParallel, ...options}) {

        super({...options,
            transform: followOrder 
                ? fifoTransformImplementation(maxParallel)
                : asapTransformImplementation(maxParallel)
        });

        const _transform = options.transform || this.constructor._transform !== PromisedTransform.prototype._transform && this.constructor._transform;
        const _transforms = [...options.transforms || []];
        if (_transform) _transforms.unshift(_transform);

        this._transforms = [];
        this.pushTranforms(..._transforms);

        this._highWaterMark = options.highWaterMark;
        this._options = {
            followOrder,
            maxParallel
        };
    }

    _getTransforms() {
        return this._transforms;
    }

    pushTranforms(...transforms) {
        for (const transform of transforms) {
            this._transforms.push([transform]);
        }
    }

    pushHandlers(...handlers) {
        for (const handler of handlers) {
            this._transforms.push([null,handler]);
        }
    }

}

module.exports = {PromisedTransform};

// Late definition of dependent methods is needed to keep parasitical inheritance
var {PromisedWritable} = require("./writable");
var {PromisedReadable} = require("./readable");

PromisedTransform.prototype.whenRead = PromisedReadable.prototype.whenRead;
PromisedTransform.prototype.whenWrote = PromisedWritable.prototype.whenWrote;
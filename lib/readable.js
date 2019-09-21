const {Readable} = require('stream');
import { PromiseTransform } from '../.d.ts/index.d';
import { PromiseWritable } from 'promised-stream';
const PromisedEmitter = require('./promised-events');
const classes = require("../");

// TODO: build already resolved promise objects as you go.
const readImplementation = function readImplementation(size) {
    let read = Promise
        .resolve(size)
        .then(this._promisedRead)
    ;
    
    if (this._transforms)
        for (let [transform, handler] of this._transforms) {
            if (!transform) read = read.catch(handler);
            else read = read.then(transform);
        }

    return read
        .then((read) => this.push(read))
        .catch((e) => this.raise(e))
    ;
};

class PromiseReadable extends Readable {

    constructor(options) {
        const read = options.read || this.constructor.prototype._read !== PromiseReadable.prototype._read && this.constructor.prototype._read;
        super({...options, read: readImplementation});

        PromisedEmitter.call(this);
        this._promisedRead = read.bind(this);
        this._promiseTransforms = options.transforms;
    }
    
    /**
     * 
     * 
     * @param {PromiseTransform|PromiseWritable} dest 
     * @param  {...any} options 
     */
    pipe(dest, ...options) {
        if (dest instanceof classes.PromiseTransform) {
            const transforms = dest._getTransforms();
            if (transforms) {
                this._promiseTransforms.push(...transforms);
                return this;
            }
        }
        return super.pipe(dest, ...options)
    }

    whenRead(...args) {
        const read = Readable.prototype.read(...args);
        
        if (read === null) return this.whence("readable").then(() => this.read(...args));
        else return Promise.resolve(read);
    }

    raise(error, position = 0) {
        const transforms = this._transforms.slice(position);

        let last = Promise.reject(error);
        if (transforms)
            for (let [transform, handler] of transforms) {
                if (!transform) last = read.catch(handler);
                else last = read.then(transform);
            }
        
        return last.catch(error => {
            this.emit("error", error);
        })
    }

    catch(handler) {
        this._transforms.push([,handler]);
        return this;
    }
}

const realHasInstance = Function.prototype[Symbol.hasInstance];
Object.defineProperty(PromiseReadable, Symbol.hasInstance, {
    value: function(object) {
        if (realHasInstance.call(this, object))
            return true;

        return object && object._read === readImplementation;
    }
});

module.exports = {PromiseReadable, readImplementation};

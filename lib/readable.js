const {Readable} = require("stream");
const PromiseEmitter = require("./promised-events");
const classes = require("../");

// TODO: build already resolved promise objects as you go.
function readImplementation(size) {
    let read = Promise
        .resolve(size)
        .then(this._promisedRead)
    ;
    
    if (this._transforms.length)
        for (let [transform, handler] of this._transforms) {
            if (transform) read = read.then(transform);
            else read = read.catch(handler);
        }

    return read;
}

function asapReadImplementation(size) {
    return readImplementation(size)
        .then(read => this.push(read))
        .catch((e) => this.raise(e))
    ;
}

function fifoReadImplementation(size, prev) {
    return Promise
        .all(readImplementation(size), prev)
        .then(([res]) => res)
        .then(read => this.push(read))
        .catch((e) => this.raise(e))
    ;
}

class PromiseReadable extends Readable {

    constructor({
        followOrder = true,
        maxParallel = 128,
        ...options
    } = {}) {
        super({
            ...options,
            objectMode: true,
            read: followOrder ? fifoReadImplementation : asapReadImplementation
        });

        PromiseEmitter.call(this);

        const read = options.read || this.constructor.prototype._read !== PromiseReadable.prototype._read && this.constructor.prototype._read;
        this._promisedRead = read.bind(this);
        this._transforms = options.transforms;

        this._options = {
            followOrder,
            maxParallel
        };
    }

    pipe(dest, ...options) {
        if (dest instanceof classes.PromiseTransform) {
            const transforms = dest._getTransforms();
            if (transforms) {
                this._transforms.push(...transforms);
                return this;
            }
        }
        return super.pipe(dest, ...options);
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
                if (!transform) last = last.catch(handler);
                else last = last.then(transform);
            }
        
        return last.catch(error => {
            this.emit("error", error);
        });
    }

    catch(handler) {
        this._transforms.push([null,handler]);
        return this;
    }

    pushTransform(transform) {
        this._transforms.push(transform);
    }

    pushHandler(handler) {
        this._transforms.push(handler);
    }
}

PromiseEmitter.extend(PromiseReadable);

const realHasInstance = Function.prototype[Symbol.hasInstance];
Object.defineProperty(PromiseReadable, Symbol.hasInstance, {
    value: function(object) {
        if (realHasInstance.call(this, object))
            return true;

        return object && object._read === readImplementation;
    }
});

module.exports = {PromiseReadable, readImplementation};

const {PromisedDuplex} = require("./duplex");
const assert = require('assert');

const priv = {
    pushTransforms(ref) {
        const idx = this._transforming.indexOf(ref);
        assert(idx >= 0);

        if (this._followOrder) {
            this._ready[idx] = this._transforming[idx];
            this._transforming[idx] = null;
            if (idx === 0) {
                const lastIdx = this._transforming.findIndex((el) => el instanceof Promise);
                this._transformed.push(...this._ready);
                this._ready = [];
                this._transforming.splice(0, lastIdx);
            }
        } else {

        }
    },
    tick: null,
    nextTick() {
        return this.tick = this.tick || new Promise((res) => process.nextTick(res)).then(() => this.tick = null);
    },
    resolved: Promise.resolve()
};

class PromisedTransform extends PromisedDuplex {

    constructor(options) {

        super(options);

        this._promisedTransform = options.transform;
        this._highWaterMark = options.highWaterMark;
        this._transforming = [];
        this._ready = [];
        this._transformed = [];

        this._followOrder = options.followOrder;

        const transform = options.transform || this.constructor._transform !== PromisedTransform.prototype._transform && this.constructor._transform;
        this._promisedTransform = transform.bind(this);
    }

    _read(count) {
        if (this._transformed.length >= count) {
            return this._transformed.splice(count);
        } else {
            return this.whenRead(count - this._transformed.length)
                .then(this.read(count));
        }
    }

    _write(chunkEntry) {
        let ref;
        this._transforming.push(
            ref = Promise.resolve(chunkEntry)
                .then(this._promisedTransform)
        );

        ref.then(priv.pushTransforms.call(this, ref));

        if (this._transforming.length < this._highWaterMark) {
            return priv.resolved;
        }

        return this._transforming[0]
            .then(priv.nextTick());
    }

}

module.exports = {PromisedTransform};

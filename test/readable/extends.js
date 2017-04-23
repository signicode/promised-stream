#!/usr/bin/env node

const {PromisedReadable} = require("../../");
const {DataStream} = require("scramjet");
const assert = require('assert');

const data = [1,2,3,4,5];

class PtrReadable extends PromisedReadable {
    constructor(options, data) {
        super(options);
        this.ptr = 0;
        this.data = data.slice();
    }

    _read() {
        return this.data[this.ptr++] || null;
    }
}

// synchronous readable
module.exports =
    () => Promise.resolve(
        new PtrReadable({
            objectMode: true,
        }, data).pipe(
            new DataStream()
        ).accumulate(
            (arr, item) => arr.push(item), []
        )
    )
    .then(
        (arr) => {
            assert.equal(arr.reduce((a, i) => a + i, 0), 15);
        }
    );

#!/usr/bin/env node

const {PromisedReadable} = require("../../");
const {DataStream} = require("scramjet");
const assert = require('assert');

const data = [1,2,3,4,5];

// synchronous readable
module.exports =
    () => Promise.resolve(
        new PromisedReadable({
            objectMode: true,
            read() {
                this.ptr = this.ptr || 0;
                return data[this.ptr++] || null;
            }
        }).pipe(
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

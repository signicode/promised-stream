#!/usr/bin/env node

const {PromisedWritable, PromisedTransform} = require("../../");
const {DataStream} = require("scramjet");
const assert = require('assert');

const data = [1,2,3,4,5];

// synchronous readable
module.exports =
    () => new Promise((res, rej) => {
        const ret = [];
        DataStream.fromArray(data)
            .pipe(
                new PromisedTransform({
                    objectMode: true,
                    transform(chunk) {
                        return chunk + 1;
                    }
                })
            )
            .pipe(new PromisedWritable({
                objectMode: true,
                write({chunk}) {
                    ret.push(chunk);
                }
            }))
            .on("error", (err) => rej(err))
            .on("end", () => res(ret));
    })
    .then(
        (arr) => {
            console.log(arr);
            assert.equal(arr.reduce((a, i) => a + i, 0), 20);
        }
    );

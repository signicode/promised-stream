
const {PromisedWritable} = require("../../");
const {DataStream} = require("scramjet");
const assert = require("assert");

const data = [1,2,3,4,5];

// synchronous readable
module.exports =
    () => new Promise((res, rej) => {
        const ret = [];
        DataStream.fromArray(data)
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
                assert.strictEqual(arr.reduce((a, i) => a + i, 0), 15);
            }
        );

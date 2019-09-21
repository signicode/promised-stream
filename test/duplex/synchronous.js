
const {PromisedDuplex} = require("../../");
const {DataStream} = require("scramjet");
const assert = require("assert");

const wdata = [1,2,3,4,5];
const rdata = ["a","b","c","d","e"];

// synchronous readable
module.exports =
    () => {
        const ret = [];
        const str = DataStream.fromArray(wdata)
            .pipe(
                new PromisedDuplex({
                    objectMode: true,
                    read() {
                        this.ptr = this.ptr || 0;
                        return rdata[this.ptr++] || null;
                    },
                    write({chunk}) {
                        ret.push(chunk);
                    }
                })
            );

        return Promise.all([
            new Promise((res, rej) =>
                str.on("error", (err) => rej(err)).on("end", () => res(ret))
            ),
            str.pipe(new DataStream())
                .accumulate((arr, item) => arr.push(item), [])
        ])
            .then(
                (arr) => {
                    assert.strictEqual(arr[0].reduce((a, i) => a + i, 0), 15);
                    assert.strictEqual(arr[1].join("-"), "a-b-c-d-e");
                }
            );
    };

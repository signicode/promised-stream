#!/usr/bin/env node

const {MultiStream, DataStream} = require("scramjet");
const path = require('path');
const debug = require('debug')("run-tests");
const fs = require("fs");

process.on("unhandledRejection", (err) => {
    console.error(err && err.stack || err);
    debugger;
});

module.exports = (dirs, to) => {
    to = to || 10000;
    return Promise.all(
        dirs.map(
            (dir) => new Promise(
                (res, rej) => {
                    debug("fs readdir", dir);
                    fs.readdir(dir, (err, list) => err ? rej(err) : res(list));
                }
            )
            .then(
                (list) => {
                    return DataStream.fromArray(list)
                        .map((file) => path.join(dir, file))
                        .filter((file) => file[0] !== '.');
                }
            )
        )
    ).then(
        (lists) => new MultiStream(lists)
            .mux(
                (a, b) => a === b ? 0 : (a < b ? -1 : 1)
            )
            .map(
                (testFile) => {
                    debug("loading test", testFile);
                    return {
                        testFile,
                        name: path.basename(testFile),
                        execution: new Promise((res) => res(require(testFile))).then((test) => test()),
                    };
                }
            )
            .map(
                (test) => {
                    return Promise.race(
                            test.execution,
                            new Promise((s,j) => setTimeout(j, to).unref())
                        )
                        .catch((e) => (debug("test failed", test.testFile, e && e.stack), {error: e}))
                        .then((out) => (debug("test succeeded", test.testFile), {outcome: out}))
                        .then((ext) => Object.assign(test, ext));
                }
            )
            .accumulate(
                (results, test) => results.push(test), []
            )

    );
};

if (!module.parent) {
    let cwd = process.cwd();
    module.exports(
            process.argv.slice(2).map(
                (dir) => path.resolve(cwd, dir)
            )
        )
        .then(
            (results) => {
                let err = 0;
                results.forEach((test) => {
                    let line = test.error ? "✘" : "✔";
                    line += " " + test.testFile.replace(cwd, '');
                    console.error(line);
                    if (test.error) {
                        err++;
                        console.error(" StackTrace" + test.error.stack);
                    }
                });
                console.error(`Result [${results.length - err} / ${results.length}]`);
            }
        )
        .catch(
            (e) => {
                console.error("An error occured" + (e ? ": " + e.stack : " with no specific reason. :/"));
                process.exit(1);
            }
        );
}

"use strict";
let _print = _interopRequireDefault(require("../../../../src/main/java/lab1/Printing"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Functionality_test = require('assert');

describe("Basic Printing Test --- Testing for correctness of solution", function () {
    it("It should works.", function () {
        let print = new _print.default();
        let expected = `Top project in the world!`;
        console.log("Testing with .toConsole()\nThe output should be:\n" + expected + "\nActual:\n" + print.toString());
        Functionality_test.equal(print.toString(), expected);
    })
});

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;

class Printing {
    string = "Top project in the world!";

    toString() {
        return(this.string);
    }
}

exports.default = Printing;

let print = new Printing();
print.toString();

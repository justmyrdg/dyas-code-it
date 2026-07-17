"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLASS_CODE_LENGTH = void 0;
exports.generateClassCode = generateClassCode;
const crypto_1 = require("crypto");
// No 0/O/1/I/L — codes get read aloud and written on whiteboards.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
exports.CLASS_CODE_LENGTH = 6;
function generateClassCode() {
    let code = '';
    for (let i = 0; i < exports.CLASS_CODE_LENGTH; i++) {
        code += ALPHABET[(0, crypto_1.randomInt)(ALPHABET.length)];
    }
    return code;
}
//# sourceMappingURL=class-code.js.map
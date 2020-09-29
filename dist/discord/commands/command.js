"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    constructor() {
        this.name = '';
        this.description = '';
        this.signature = '';
    }
    getSignature() {
        return this.signature;
    }
}
exports.Command = Command;

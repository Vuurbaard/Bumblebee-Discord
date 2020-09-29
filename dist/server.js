"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const process_1 = __importDefault(require("process"));
const app = new app_1.App();
app.boot();
process_1.default.on('beforeExit', async () => {
    await app.shutdown();
});
process_1.default.once("SIGHUP", async () => {
    await app.shutdown();
});

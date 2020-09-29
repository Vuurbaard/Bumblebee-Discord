"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const tsyringe_1 = require("tsyringe");
const environment_1 = require("./environment");
const log4js_1 = __importDefault(require("log4js"));
let Log = class Log {
    constructor(env) {
        this.env = env;
        this.logger = log4js_1.default.getLogger();
        this.logger.level = env.get('LOG_LEVEL');
    }
    info(message, ...args) {
        this.logger.info(message, ...args);
        return this;
    }
    warn(message, ...args) {
        this.logger.warn(message, ...args);
        return this;
    }
    debug(message, ...args) {
        this.logger.debug(message, ...args);
        return this;
    }
    error(message, ...args) {
        this.logger.error(message, ...args);
        return this;
    }
    fatal(message, ...args) {
        this.logger.fatal(message, ...args);
        return this;
    }
};
Log = __decorate([
    tsyringe_1.singleton(),
    __param(0, tsyringe_1.inject(environment_1.Environment)),
    __metadata("design:paramtypes", [environment_1.Environment])
], Log);
exports.Log = Log;

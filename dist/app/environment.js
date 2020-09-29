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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const tsyringe_1 = require("tsyringe");
let Environment = class Environment {
    constructor() {
        let dotEnvPath = fs_1.default.existsSync(path_1.default.resolve(process.cwd(), '..', '.env')) ? path_1.default.resolve(process.cwd(), '..', '.env') : path_1.default.resolve(process.cwd(), '.env');
        dotenv_1.default.config({
            'path': dotEnvPath
        });
    }
    get(name, def = '') {
        var _a;
        return (_a = process.env[name]) !== null && _a !== void 0 ? _a : def;
    }
};
Environment = __decorate([
    tsyringe_1.singleton(),
    __metadata("design:paramtypes", [])
], Environment);
exports.Environment = Environment;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bumblebee = void 0;
const tsyringe_1 = require("tsyringe");
const environment_1 = require("../app/environment");
const request = __importStar(require("request-promise-native"));
const temp = __importStar(require("temp"));
let Bumblebee = class Bumblebee {
    constructor(env) {
        this.token = env.get('BUMBLEBEE_TOKEN');
        this.host = env.get('API_HOST', 'https://api.bmbl.cloud');
    }
    async tts(message) {
        const options = {
            url: this.host + '/v1/tts?format=opus',
            body: { "text": message },
            json: true,
            headers: { 'Authorization': this.token }
        };
        let data = await request.post(options);
        if (data && data.file) {
            let file = temp.createWriteStream({ suffix: '.opus' });
            let stream = request.get(this.host + data.file).pipe(file);
            console.log("Full fill");
            await new Promise(fullfill => stream.on('finish', () => {
                console.log(" stream done");
                fullfill();
            }));
            console.log("Done?");
            return file.path;
        }
        return '';
    }
};
Bumblebee = __decorate([
    tsyringe_1.singleton(),
    __param(0, tsyringe_1.inject(environment_1.Environment)),
    __metadata("design:paramtypes", [environment_1.Environment])
], Bumblebee);
exports.Bumblebee = Bumblebee;

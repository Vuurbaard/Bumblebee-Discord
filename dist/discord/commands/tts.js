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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTS = void 0;
const command_1 = require("./command");
const tsyringe_1 = require("tsyringe");
const bumblebee_1 = require("../../bumblebee/bumblebee");
const log_1 = require("../../app/log");
let TTS = class TTS extends command_1.Command {
    constructor(bumblebee, log) {
        super();
        this.name = 'tts';
        this.description = '';
        this.signature = '';
        this.bumblebee = bumblebee;
    }
    execute(message, args, guildState) {
        // Queue TTS -> Queue into voice queuer which should play until queue is empty
        let text = args.get('rawArguments');
        this.bumblebee.tts(text).then((data) => {
            if (message.member && message.member.voice && message.member.voice.channel && data != null) {
                guildState.setVoiceChannel(message.member.voice.channel);
                guildState.addToVoiceQueue(data);
            }
        });
    }
    ;
};
TTS = __decorate([
    tsyringe_1.injectable(),
    __metadata("design:paramtypes", [bumblebee_1.Bumblebee, log_1.Log])
], TTS);
exports.TTS = TTS;

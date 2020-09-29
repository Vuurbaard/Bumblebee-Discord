"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildState = void 0;
const tsyringe_1 = require("tsyringe");
const log_1 = require("../app/log");
const queue_1 = __importDefault(require("./queue/queue"));
class GuildState {
    constructor(guild) {
        this.guild = guild;
        this.voiceQueue = new queue_1.default();
    }
    getGuildId() {
        return this.guild.id;
    }
    addToVoiceQueue(file) {
        const log = tsyringe_1.container.resolve(log_1.Log);
        this.voiceQueue.push(async (queue) => {
            if (this.voiceChannel) {
                if (!this.connection) {
                    this.connection = await this.voiceChannel.join();
                }
                if (this.connection.dispatcher) {
                    console.log("KILL?");
                    this.connection.dispatcher.end();
                }
                try {
                    let dispatcher = this.connection.play(file, {
                        'bitrate': 'auto',
                        'highWaterMark': 16
                    });
                    let _vm = this;
                    dispatcher.on('start', function () {
                        if (_vm.connection) {
                            let player = _vm.connection.player;
                            player.streamingData.pausedTime = 0;
                        }
                    });
                    dispatcher.on('finish', function () {
                        console.log("finish");
                        queue.finish();
                    });
                    dispatcher.on('error', function (reason) {
                        queue.finish();
                    });
                    dispatcher.on('debug', function (info) {
                        console.debug(info);
                    });
                }
                catch (e) {
                    console.error(e);
                    queue.finish();
                }
            }
        });
        this.voiceQueue.run();
    }
    setVoiceChannel(channel) {
        this.voiceChannel = channel;
    }
}
exports.GuildState = GuildState;

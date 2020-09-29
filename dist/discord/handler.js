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
exports.DiscordHandler = void 0;
const tsyringe_1 = require("tsyringe");
const Discord = __importStar(require("discord.js"));
const environment_1 = require("../app/environment");
const log_1 = require("../app/log");
const state_manager_1 = require("./state-manager");
const tts_1 = require("./commands/tts");
const bumblebee_1 = require("../bumblebee/bumblebee");
let DiscordHandler = class DiscordHandler {
    constructor(env, log, stagemanager) {
        this.env = env;
        this.log = log;
        this.stagemanager = stagemanager;
        this.client = new Discord.Client();
        this.commands = [
            new tts_1.TTS(tsyringe_1.container.resolve(bumblebee_1.Bumblebee), tsyringe_1.container.resolve(log_1.Log))
        ];
    }
    boot() {
        // Register events within current Handler
        this.client.on('ready', () => { this.onReady(); });
        this.client.on('message', (msg) => { this.onMessage(msg); });
        return new Promise((res, rej) => {
            const vm = this;
            // Add another handler to wait for ready
            this.client.on('ready', () => {
                res(vm);
            });
            this.client.login(this.env.get('DISCORD_TOKEN'));
        });
    }
    shutdown() {
        return new Promise((res, rej) => {
            res(true);
        });
    }
    onReady() {
        var _a, _b, _c;
        this.log.info(`Logged into Discord as ${(_a = this.client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
        this.log.info(`To allow this bot onto your server, go to the following url:`);
        this.log.info(`https://discordapp.com/api/oauth2/authorize?client_id=${(_b = this.client.user) === null || _b === void 0 ? void 0 : _b.id}&scope=bot&permissions=103890496`);
        this.log.info(`into Discord as ${(_c = this.client.user) === null || _c === void 0 ? void 0 : _c.tag}`);
    }
    onMessage(msg) {
        this.log.debug(msg.author.username, ":", msg.content);
        // // Ignore other bot messages
        if (msg.author.bot) {
            return;
        }
        // Force -tts when using bumblebee channel
        if (msg.channel instanceof Discord.TextChannel && msg.channel.name.indexOf("bumblebee") >= 0) {
            msg.content = this.env.get('DISCORD_COMMAND_PREFIX') + 'tts ' + msg.content;
        }
        let command = this.parseCommand(msg);
        if (command) {
            command();
        }
    }
    // Return Closure to run command if any found
    parseCommand(msg) {
        var _a;
        let prefix = this.env.get('DISCORD_COMMAND_PREFIX');
        let content = msg.content;
        // Check if we match prefix
        if (content.length > prefix.length && content.slice(0, prefix.length) === prefix) {
            // First parse content to figure out what we are doing
            let str = content.substr(prefix.length, content.length - prefix.length).trim().replace(/ +(?= )/g, '');
            let parsed = str.split(' ');
            if (parsed.length > 0) {
                let commandName = parsed.shift();
                let target = null;
                // Check our array if we have any items matching the name
                let matching = this.commands.filter((command) => {
                    return command.name === commandName;
                });
                if (matching.length > 0) {
                    target = matching[0];
                }
                if (target != null) {
                    this.log.debug('Found command ' + target.name);
                    // Parse any arguments into the signature of the command
                    let signature = target.getSignature();
                    let reg = /\{([A-z0-9_\-]+)\}/g;
                    let matches = (_a = signature.match(reg)) === null || _a === void 0 ? void 0 : _a.map((item) => {
                        return item.replace('{', '').replace('}', '');
                    });
                    // Transform to map now
                    let mappedArgs = new Map();
                    mappedArgs.set('rawCommand', content);
                    mappedArgs.set('rawArguments', parsed.join(' '));
                    if (matches !== undefined) {
                        for (let index = 0; index < matches.length; index++) {
                            const element = matches[index];
                            if (parsed[index] != null) {
                                mappedArgs.set(element, parsed[index]);
                            }
                        }
                    }
                    return () => {
                        let guildState = this.stagemanager.getByMessage(msg);
                        if (guildState) {
                            this.log.debug('Executing command ' + (target === null || target === void 0 ? void 0 : target.name));
                            target === null || target === void 0 ? void 0 : target.execute(msg, mappedArgs, guildState);
                        }
                    };
                }
            }
        }
        return null;
    }
};
DiscordHandler = __decorate([
    tsyringe_1.injectable(),
    __param(0, tsyringe_1.inject(environment_1.Environment)),
    __param(1, tsyringe_1.inject(log_1.Log)),
    __param(2, tsyringe_1.inject(state_manager_1.StateManager)),
    __metadata("design:paramtypes", [environment_1.Environment,
        log_1.Log,
        state_manager_1.StateManager])
], DiscordHandler);
exports.DiscordHandler = DiscordHandler;

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const tsyringe_1 = require("tsyringe");
const guild_state_1 = require("./guild-state");
let StateManager = class StateManager {
    constructor() {
        this.guilds = [];
    }
    /**
     * getByMessage
     */
    getByMessage(msg) {
        let guildState = null;
        let found = this.guilds.filter((guildState) => {
            var _a;
            return guildState.getGuildId() == ((_a = msg.guild) === null || _a === void 0 ? void 0 : _a.id);
        });
        if (found.length > 0) {
            guildState = found[0];
        }
        else {
            if (msg.guild) {
                guildState = new guild_state_1.GuildState(msg.guild);
                this.guilds.push(guildState);
            }
        }
        return guildState;
    }
};
StateManager = __decorate([
    tsyringe_1.singleton()
], StateManager);
exports.StateManager = StateManager;

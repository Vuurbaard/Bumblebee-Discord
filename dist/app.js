"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const environment_1 = require("./app/environment");
const handler_1 = require("./discord/handler");
const log_1 = require("./app/log");
class App {
    constructor() {
        this.singletons = [];
        this.bootables = [
            this.resolve(handler_1.DiscordHandler)
        ];
        this.environment = this.resolve(environment_1.Environment);
        this.log = this.resolve(log_1.Log);
        this.booted = [];
    }
    addBootable(bootable) {
        this.bootables.push(bootable);
        return this;
    }
    boot() {
        this.log.info('Bootstrapping Application');
        let waitForBoot = this.bootables.map((bootable) => {
            return new Promise((res, rej) => {
                this.log.debug('Booting ' + bootable.constructor.name);
                bootable.boot().then((bootable) => {
                    this.booted.push(bootable);
                    return res(bootable);
                }).catch(() => {
                    this.log.error("Failed booting");
                    rej();
                });
            });
        });
        Promise.all(waitForBoot).then(() => {
            this.log.info('Bootstrapping done. Enjoy your application :)');
        });
        return this;
    }
    async shutdown() {
        this.log.info('Application shutdown initiated');
        let waitForShutdown = this.bootables.map((bootable) => {
            return new Promise((res, rej) => {
                this.log.debug('Booting ' + bootable.constructor.name);
                return res(bootable.shutdown());
            });
        });
        await Promise.all(waitForShutdown).then(() => {
            this.log.info('Application shutdown completed');
        });
    }
    resolve(token) {
        return tsyringe_1.container.resolve(token);
    }
    isBooted() {
        return this.booted.length === this.bootables.length;
    }
}
exports.App = App;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const log_1 = require("../../app/log");
class Queue {
    constructor() {
        this.jobs = [];
        this.running = false;
        this.stackSize = 25;
        setInterval(this.run, 1000);
    }
    push(func) {
        if (this.jobs.length < this.stackSize) {
            this.jobs.push(func);
        }
        return this.jobs.length;
    }
    run() {
        let log = tsyringe_1.container.resolve(log_1.Log);
        if (!this.running && Array.isArray(this.jobs) && this.jobs.length > 0) {
            log.info("Running queue with:", this.jobs.length, "in queue");
            this.running = true;
            let task = this.jobs.shift();
            if (task) {
                try {
                    task(this);
                }
                catch (e) {
                    console.error(e);
                    this.running = false;
                }
            }
        }
    }
    finish() {
        this.running = false;
        this.run();
    }
}
exports.default = Queue;

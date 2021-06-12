import { container } from "tsyringe";
import { Log } from "../../app/log";

export default class Queue {
  private jobs: Array<Function> = [];
  private running = false;
  private stackSize = 25;

  constructor() {
    setInterval(this.run, 1000);
  }

  public push(func: Function): any {
    if (this.jobs.length < this.stackSize) {
      this.jobs.push(func);
    }

    return this.jobs.length;
  }

  public run() {
    const log = container.resolve(Log);
    if (!this.running && Array.isArray(this.jobs) && this.jobs.length > 0) {
      log.info("Running queue with:", this.jobs.length, "in queue");
      this.running = true;
      const task = this.jobs.shift();
      if (task) {
        try {
          task(this);
        } catch (e) {
          // console.error(e);
          this.running = false;
        }
      }
    } else {
      if (Array.isArray(this.jobs) && this.jobs.length == 0) {
      }
    }
  }

  public clear() {
    this.jobs = [];
    this.running = false;
  }

  public finish() {
    this.running = false;
    this.run();
  }

  public size() {
    return this.jobs.length;
  }
}

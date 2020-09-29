import { container } from "tsyringe";
import { Log } from "../../app/log";

export default class Queue {
    private jobs: Array<Function> = [];
    private running: boolean = false;
    private stackSize: number = 25;
    private poller?: number;

    public push(func: Function): any
    {
        if(this.jobs.length < this.stackSize){
            this.jobs.push(func);
        }
        
        return this.jobs.length;
    }

    public run() {
        let log = container.resolve(Log);
        log.info("Running queue with:", this.jobs.length, "in queue");
        if(!this.running && this.jobs.length > 0){
            this.running = true;
            let task = this.jobs.shift();
            if(task) {
                try{
                    task(this);
                } catch (e) {
                    console.error(e);
                    this.running = false;
                }
            }
        }
    }

    public finish(){
        this.running = false;
		this.run();
    }
}
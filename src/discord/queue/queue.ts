import { container } from "tsyringe";
import { Log } from "../../app/log";

export default class Queue {
    private jobs: Array<Function> = [];
    private running: boolean = false;
    private stackSize: number = 25;

    constructor(){
        setInterval(this.run, 1000);
    }

    public push(func: Function): any
    {
        if(this.jobs.length < this.stackSize){
            this.jobs.push(func);
        }
        
        return this.jobs.length;
    }

    public run() {
        let log = container.resolve(Log);
        if(!this.running && Array.isArray(this.jobs) && this.jobs.length > 0){
            log.info("Running queue with:", this.jobs.length, "in queue");
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
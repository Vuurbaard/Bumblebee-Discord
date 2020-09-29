import { Bootable } from "./app/bootable";
import "reflect-metadata";
import {container, InjectionToken} from "tsyringe";
import { Environment } from "./app/environment";
import { DiscordHandler } from "./discord/handler";
import { Log } from "./app/log";


export class App {

    protected singletons: Array<any>;
    protected bootables: Array<Bootable>;

    protected environment: Environment;
    protected log: Log;

    private booted: Array<Bootable>;    


    constructor(){
        this.singletons = [];
        this.bootables = [
            this.resolve(DiscordHandler)
        ];

        this.environment = this.resolve(Environment);
        this.log = this.resolve(Log);
        this.booted = [];
    }


    public addBootable(bootable: Bootable){
        this.bootables.push(bootable);

        return this;
    }

    public boot()
    {
        this.log.info('Bootstrapping Application');
        
        let waitForBoot = this.bootables.map((bootable: Bootable) => {
            return new Promise((res,rej) => {
                this.log.debug('Booting ' + bootable.constructor.name);
                bootable.boot().then((bootable: Bootable) => {
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

    public async shutdown()
    {
        this.log.info('Application shutdown initiated');
        let waitForShutdown = this.bootables.map((bootable: Bootable) => {
            return new Promise((res,rej) => {
                this.log.debug('Booting ' + bootable.constructor.name);
                return res(bootable.shutdown());
            });
        });

        await Promise.all(waitForShutdown).then(() => {
            this.log.info('Application shutdown completed');
        });
    }

    public resolve<T>(token: InjectionToken<T>): T{
        return container.resolve(token);
    }

    public isBooted()
    {
        return this.booted.length === this.bootables.length;
    }

}
import { Command } from "./command";
import * as Discord from 'discord.js';
import { container, injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";
import { CommandArguments } from "./commandArguments";
import { StateManager } from "../state-manager";

@injectable()
export class Skip extends Command {
    public name: string = 'skip';
    public description: string = '';
    public signature: string = '';
    private bumblebee: Bumblebee;
    private client: Discord.Client;

    constructor(bumblebee: Bumblebee, client : Discord.Client, log: Log){
        super();
        this.bumblebee = bumblebee;
        this.client = client;
    }

    public execute(args: CommandArguments, message: Discord.Message) : void {
        let stateManager = container.resolve(StateManager);
        let guildState = stateManager.getByMessage(message);

        if(guildState && guildState.isConnected()){
            guildState.skipItem();
        }
    };
}
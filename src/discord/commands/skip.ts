import { Command } from "./command";
import * as Discord from 'discord.js';
import { container, injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";
import { CommandArguments } from "./commandArguments";
import { StateManager } from "../state-manager";

@injectable()
export class Skip extends Command {
    public name = 'skip';
    public description = '';
    public signature = '';
    private bumblebee: Bumblebee;
    private client: Discord.Client;

    constructor(bumblebee: Bumblebee, client : Discord.Client, log: Log){
        super();
        this.bumblebee = bumblebee;
        this.client = client;
    }

    public execute(args: CommandArguments, message: Discord.Message) : void {
        const stateManager = container.resolve(StateManager);
        const guildState = stateManager.getByMessage(message);

        if(guildState && guildState.isConnected()){
            guildState.skipItem();
        }
    }
}
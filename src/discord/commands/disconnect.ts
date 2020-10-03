import { Command } from "./command";
import * as Discord from 'discord.js';
import { GuildState } from "../guild-state";
import { container, injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";
import { CommandArguments } from "./commandArguments";
import { StateManager } from "../state-manager";

@injectable()
export class Disconnect extends Command {
    public name: string = 'disconnect';
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
            message.reply('👋 Disconnecting as requested');
            guildState.disconnect();
        } else {
            message.reply('❗ Cannot disconnect as i\'m not connected to any voice channel');
        }
    };
}
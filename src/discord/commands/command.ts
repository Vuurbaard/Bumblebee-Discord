import * as Discord from 'discord.js';
import { GuildState } from '../guild-state';


export abstract class Command {

    public name: string = '';
    public description: string = '';
    public signature: string = '';

    public abstract execute(message : Discord.Message, args : Map<string,any>, guildState: GuildState) : void; // Don't return anything.

    
    public getSignature() {
        return this.signature;
    }

}
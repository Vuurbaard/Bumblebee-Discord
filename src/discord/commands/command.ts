import * as Discord from 'discord.js';


export abstract class Command {

    public name: string = '';
    public description: string = '';
    public signature: string = '';

    public abstract execute(message : Discord.Message, args : Map<string,any>) : void; // Don't return anything.

    
    public getSignature() {
        return this.signature;
    }

}
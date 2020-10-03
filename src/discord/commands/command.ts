import { Message } from 'discord.js';
import { CommandArguments } from './commandArguments';


export abstract class Command {

    public name: string = '';
    public description: string = '';
    public signature: string = '';

    public abstract execute(args : CommandArguments, message: Message) : void; // Don't return anything.

    
    public getSignature() {
        return this.signature;
    }

}
import { Command } from "./command";
import * as Discord from 'discord.js';


export class TTS extends Command {
    public name: string = 'tts';
    public description: string = '';
    public signature: string = '';

    public execute(message : Discord.Message, args : Map<string,any>) : void {
        console.log(message);
        console.log(args);
    };
}
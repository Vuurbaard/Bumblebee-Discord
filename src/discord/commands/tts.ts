import { Command } from "./command";
import * as Discord from 'discord.js';
import { GuildState } from "../guild-state";
import { injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";

@injectable()
export class TTS extends Command {
    public name: string = 'tts';
    public description: string = '';
    public signature: string = '';
    private bumblebee: Bumblebee;

    constructor(bumblebee: Bumblebee, log: Log){
        super();
        this.bumblebee = bumblebee;
    }

    public execute(message : Discord.Message, args : Map<string,any>, guildState: GuildState) : void {
        // Queue TTS -> Queue into voice queuer which should play until queue is empty
        let text = args.get('rawArguments');

        this.bumblebee.tts(text).then((data) => {
            if(message.member && message.member.voice && message.member.voice.channel && data != null){
                guildState.setVoiceChannel(message.member.voice.channel);
                guildState.addToVoiceQueue(data);
            }
        });        
    };
}
import { Command } from "./command";
import * as Discord from 'discord.js';
import { container, injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";
import { CommandArguments } from "./commandArguments";
import { StateManager } from "../state-manager";

@injectable()
export class TTS extends Command {
    public name: string = 'tts';
    public description: string = '';
    public signature: string = '';
    private bumblebee: Bumblebee;
    private log : Log

    constructor(bumblebee: Bumblebee, log: Log){
        super();
        this.bumblebee = bumblebee;
        this.log = log;
    }

    public execute(args: CommandArguments, message: Discord.Message) : void {
        let text = args.arguments().join(' ').trim();
        let stateManager = container.resolve(StateManager);
        let guildState = stateManager.getByMessage(message);
        
        if(text.length > 0 ){
            this.log.info('Retrieving tts for', text, ' for guild ', guildState?.getGuildId() );
            this.bumblebee.tts(text).then((data) => {
                
                if(data){
                    this.log.debug('TTS response received with file', data.getFile());
                    if(data.hasMissingWords()){
                        const missingWords = data.getMissingWords();
                        const delimit = ', ';

                        let str = missingWords.join(delimit);
                        let lastC = str.lastIndexOf(delimit);

                        message.reply('Missing words: ' +  str.substring(0, lastC) + ' and ' + str.substring(lastC + delimit.length, str.length));
                    }


                    if(guildState && message.member && message.member.voice && message.member.voice.channel){
                        this.log.info('💬 TTS to ', message.member.voice.channel.name );
                        guildState.setVoiceChannel(message.member.voice.channel);
                        guildState.addToVoiceQueue(data.getFile());
                    }
                } else {
                    this.log.debug('TTS response failed');
                }
            })
        }      
    };
}
import { Command } from "./command";
import * as Discord from 'discord.js';
import { container, injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";
import { CommandArguments } from "./commandArguments";
import { StateManager } from "../state-manager";
import * as _ from 'lodash';  

@injectable()
export class TTS extends Command {
    public name = 'tts';
    public description = '';
    public signature = '';
    private bumblebee: Bumblebee;
    private log : Log

    constructor(bumblebee: Bumblebee, log: Log){
        super();
        this.bumblebee = bumblebee;
        this.log = log;
    }

    public execute(args: CommandArguments, message: Discord.Message) : void {
        const text = args.arguments().join(' ').trim();
        const stateManager = container.resolve(StateManager);
        const guildState = stateManager.getByMessage(message);
        
        if(text.length > 0 ){
            this.log.info('Retrieving tts for', text, ' for guild ', guildState?.getGuildId() );
            

            this.bumblebee.tts(text).then((data) => {
                let missingWords = text.split(' ');
                
                if(data){
                    this.log.debug('TTS response received with file', data.getFile());
                    
                    if(data.hasMissingWords()){
                        missingWords = data.getMissingWords();

                        message.reply(this.formatMissingWords(missingWords));

                    }

                    if(guildState && message.member && message.member.voice && message.member.voice.channel){
                        const channel = message.member.voice.channel;

                        if(channel.joinable){
                            this.log.info('💬 TTS to', message.member.voice.channel.name );
                            guildState.setVoiceChannel(message.member.voice.channel);
                            guildState.addToVoiceQueue(data.getFile());
                        } else {
                            message.reply('I cannot join the voice channel ' + message.member.voice.channel.name + ' because I don\'t have the privileges to join it.');
                        }

                    }
                } else {
                    this.log.debug('TTS response failed');
                    message.reply(this.formatMissingWords(missingWords));
                }
            })
        }      
    }

    private formatMissingWords(words: Array<string>){
        const delimit = ', ';
        const uniqueWords = _.uniq(words).map((word) => {
            return `\`${word}\``;
        });
        const str = uniqueWords.join(delimit);
        const lastC = str.lastIndexOf(delimit);

        let reply = '';

        if(uniqueWords.length == 1){
            reply = `**Missing word:** ${str}`;
        }

        if(uniqueWords.length > 1){
            reply = `**Missing words:** ${str.substring(0, lastC)} and ${str.substring(lastC + delimit.length, str.length).trim()}`;
        }
    
        
        return reply;
    }
}
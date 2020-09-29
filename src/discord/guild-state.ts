
import { Guild, VoiceChannel } from 'discord.js';
import { container } from 'tsyringe';
import { Log } from '../app/log';
import Queue from './queue/queue';

export class GuildState {
    private guild: Guild;
    private voiceQueue: Queue;
    private voiceChannel?: VoiceChannel;

    constructor(guild: Guild){
        this.guild = guild;
        this.voiceQueue = new Queue();
    }


    public getGuildId() {
        return this.guild.id;
    }

    public addToVoiceQueue(file: string) {
        const log = container.resolve(Log);

        this.voiceQueue.push(async (queue: Queue) => {
            if(this.voiceChannel){
                let connection = await this.voiceChannel.join();
                try{
                    console.log(file);
                    let dispatcher = connection.play(file);
                
                    dispatcher.on('start', function () {
                        let player = connection.player as any;
                        player.streamingData.pausedTime = 0;
                    });

    
                    dispatcher.on('finish', function () {
                        let player = connection.player as any;
                        player.streamingData.pausedTime = 0;
                        queue.finish();
                    });
    
                    dispatcher.on('error', function (reason) {
                        let player = connection.player as any;
                        player.streamingData.pausedTime = 0;
                        queue.finish();
                    });
    
                    dispatcher.on('debug', function (info) {
                        console.debug(info)
                    });
                }catch(e){
                    console.error(e);
                    queue.finish();
                }
 
            }
        });

        this.voiceQueue.run();
    }

    public setVoiceChannel(channel: VoiceChannel){
        this.voiceChannel = channel;
    }

}



import { BroadcastDispatcher, Guild, VoiceChannel, VoiceConnection } from 'discord.js';
import { Readable, Stream, Writable } from 'stream';
import { container } from 'tsyringe';
import { Log } from '../app/log';
import Queue from './queue/queue';
import * as fs from 'fs';

export class GuildState {
    private guild: Guild;
    private voiceQueue: Queue;
    private voiceChannel?: VoiceChannel;
    private connection?: VoiceConnection;

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
                if(!this.connection){
                    this.connection = await this.voiceChannel.join();
                }              

                if(this.connection.dispatcher){
                    console.log("KILL?");
                    this.connection.dispatcher.end();    
                }


                try{
                    let dispatcher = this.connection.play(file, {
                        'bitrate': 'auto',
                        'highWaterMark': 16
                    });
                
                    let _vm = this;
                    dispatcher.on('start', function () {
                        if(_vm.connection){
                            let player = _vm.connection.player as any;
                            player.streamingData.pausedTime = 0;
                        }
                    });

                    dispatcher.on('finish', function () {
                        queue.finish();
                    });
    
                    dispatcher.on('error', function (reason) {
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


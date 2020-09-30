
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
    private timer?: NodeJS.Timeout;

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
                this.clearCounter();

                if(!this.connection || (this.connection && this.connection.channel.id != this.voiceChannel.id)){
                    this.connection = await this.voiceChannel.join();
                }              

                if(this.connection.dispatcher){
                    this.connection.dispatcher.end();    
                }
                let _vm = this;


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
                        _vm.setCounter();
                        queue.finish();
                    });
    
                    dispatcher.on('error', function (reason) {
                        _vm.setCounter();
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

    private clearCounter() {
        if(this.timer){
            clearTimeout(this.timer);
        }
    }

    private setCounter() {
        this.clearCounter();
        
        let _vm = this;
        this.timer = setTimeout( function() {
            console.log("Maybe i should leave")
            if(_vm.voiceChannel){
                console.log("lets leave");
                _vm.voiceChannel.leave();
                delete _vm.voiceChannel;
            }

            if(_vm.connection){
                _vm.connection.disconnect();
                delete _vm.connection;
            }
        }, 300000);
    }

    public setVoiceChannel(channel: VoiceChannel){
        this.voiceChannel = channel;
    }

}


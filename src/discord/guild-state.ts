
import { Guild, VoiceChannel, VoiceConnection } from 'discord.js';
import MemoryStream from 'memorystream';
import { container } from 'tsyringe';
import { Log } from '../app/log';
import Queue from './queue/queue';


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

    public skipItem(){
        if(this.voiceQueue.size() >= 0 && this.connection && this.voiceChannel){
            this.connection.dispatcher.end();
        }
    }

    public async addToVoiceQueue(file: string|MemoryStream) {
        const log = container.resolve(Log);

        await this.voiceQueue.push(async (queue: Queue) => {
            if(this.voiceChannel){
                this.clearCounter();

                if(!this.connection || (this.connection && this.connection.channel.id != this.voiceChannel.id)){
                    try{
                        this.connection = await this.voiceChannel.join();
                    } catch (e) {
                        log.error('Unable to process TTS file', e);
                    }
                }    
                
                if(this.connection){
                    if(this.connection.dispatcher){
                        this.connection.dispatcher.end();    
                    }

                    const _vm = this;
        
                    try{
    
                        const dispatcher = this.connection.play(file, {
                            'bitrate': 'auto',
                            'highWaterMark': 16
                        });
                    
                        const _vm = this;
                        dispatcher.on('start', function () {
                            if(_vm.connection){
                                const player = _vm.connection.player as any;
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
                        log.error(e);
                        queue.finish();
                    }
                } 
            }
        });

        this.voiceQueue.run();

        // return status;
    }

    private clearCounter() {
        if(this.timer){
            clearTimeout(this.timer);
        }
    }

    private setCounter() {
        this.clearCounter();
        
        const _vm = this;
        this.timer = setTimeout( function() {
            _vm.disconnect();
        }, 300000);
    }

    public setVoiceChannel(channel: VoiceChannel){
        this.voiceChannel = channel;
    }

    public isConnected(){
        return this.connection && this.voiceChannel;
    }

    public disconnect() {
        if(this.voiceChannel){
            this.voiceChannel.leave();
            delete this.voiceChannel;
        }

        if(this.connection){
            this.connection.disconnect();
            delete this.connection;
        }

        this.voiceQueue.clear();
    }

}


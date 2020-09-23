import { Bootable } from "../app/bootable";
import { injectable, inject, container } from "tsyringe";
import * as Discord from 'discord.js';
import { Environment } from "../app/environment";
import { Log } from "../app/log";
import { Command } from "./commands/command";
import instance from "tsyringe/dist/typings/dependency-container";
import { TTS } from "./commands/tts";


@injectable()
export class DiscordHandler implements Bootable {

    private client : Discord.Client;
    private commands: Array<Command>;

    constructor(
        @inject(Environment) private env: Environment ,
        @inject(Log) private log: Log 
    ){
        this.client = new Discord.Client();
        this.commands = [
            new TTS()
        ];

    }

    public boot() : Promise<this>
    {
        // Register events within current Handler
        this.client.on('ready', () => { this.onReady() });
        this.client.on('message', (msg) => { this.onMessage(msg) });

        return new Promise((res,rej) => {
            const vm = this;
            // Add another handler to wait for ready
            this.client.on('ready', () => {
                res(vm);
            });
            this.client.login(this.env.get('DISCORD_TOKEN'));
            
        });
    }

    public shutdown(): Promise<boolean> {
        return new Promise((res,rej) => {
            res(true);
        });
    }

    onReady() {
        this.log.info(`Logged into Discord as ${this.client.user?.tag}`);
        this.log.info(`To allow this bot onto your server, go to the following url:`);
        this.log.info(`https://discordapp.com/api/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot&permissions=103890496`);
        this.log.info(`into Discord as ${this.client.user?.tag}`);
    }

    onMessage(msg : Discord.Message) {
        this.log.debug(msg.author.username, ":", msg.content)
        // // Ignore other bot messages
        if(msg.author.bot) {
            return;
        }

        
        // Force -tts when using bumblebee channel
        if( msg.channel instanceof Discord.TextChannel && msg.channel.name.indexOf("bumblebee") ){
            msg.content = this.env.get('DISCORD_COMMAND_PREFIX') + 'tts ' + msg.content;
        }
        
        let command = this.parseCommand(msg);

        if(command != null) {
            command();
        }
    }

    // Return Closure to run command if any found
    parseCommand(msg : Discord.Message) : Function | null {
        let prefix = this.env.get('DISCORD_COMMAND_PREFIX');
        let content = msg.content;

        // Check if we match prefix
        if(content.length > prefix.length && content.slice(0,prefix.length) === prefix){
            // First parse content to figure out what we are doing
            let str = content.substr(prefix.length, content.length - 1).trim().replace(/ +(?= )/g,'');
            let parsed = str.split(' ');

            if(parsed.length > 0) {
                let commandName = parsed.shift();
                let target = null as Command | null;
                
                // Check our array if we have any items matching the name
                let matching = this.commands.filter((command: Command) => {
                    return command.name === commandName;
                });

                if(matching.length > 0) {
                    target = matching[0];
                }
                                
                if(target != null) {
                    this.log.debug('Found command ' + target.name);
                    // Parse any arguments into the signature of the command
                    let signature = target.getSignature();
                    let reg = /\{([A-z0-9_\-]+)\}/g;
                    let matches = signature.match(reg)?.map((item) => {
                        return item.replace('{', '').replace('}','');
                    });

                    // Transform to map now
                    let mappedArgs = new Map<string,string>();
                    
                    if(matches !== undefined) {
                        for (let index = 0; index < matches.length; index++) {
                            const element = matches[index];
                            if(parsed[index] != null){
                                mappedArgs.set(element, parsed[index]);
                            }
                        }
                    }

                    return () => {
                        this.log.debug('Executing command ' + target?.name);
                        target?.execute(msg, mappedArgs);
                    };
                }
            }
        }



        return null;
    }

}
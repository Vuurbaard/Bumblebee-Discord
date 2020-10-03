import { Bootable } from "../app/bootable";
import { injectable, inject, container } from "tsyringe";
import * as Discord from 'discord.js';
import { Environment } from "../app/environment";
import { Log } from "../app/log";
import { Command } from "./commands/command";
import { StateManager } from "./state-manager";
import { TTS } from "./commands/tts";
import { Bumblebee } from "../bumblebee/bumblebee";
import { Disconnect } from "./commands/disconnect";
import { Parser } from "./commands/parser";
import { Skip } from "./commands/skip";

@injectable()
export class DiscordHandler implements Bootable {

    private client : Discord.Client;
    private commands: Array<Command>;

    constructor(
        @inject(Environment) private env: Environment ,
        @inject(Log) private log: Log ,
        @inject(StateManager) private stagemanager: StateManager 
    ){
        this.client = new Discord.Client();

        container.register<Discord.Client>(Discord.Client, {useValue: this.client});

        this.commands = [
            new TTS(container.resolve(Bumblebee), container.resolve(Log)),
            new Disconnect(container.resolve(Bumblebee), this.client, container.resolve(Log)),
            new Skip(container.resolve(Bumblebee), this.client, container.resolve(Log))
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

        let parser = new Parser(this.env.get('DISCORD_COMMAND_PREFIX'), msg.content);

        // Check if we don't have a command on our hands
        let command = this.findCommand(parser.getCommandName());

        if( msg.channel instanceof Discord.TextChannel && msg.channel.name.indexOf("bumblebee") >= 0 && !command )
        {
            command = this.findCommand('tts');
        }


        if(command){
            this.log.debug('Found command', command.name, 'to execute');
            this.runCommand(command, parser, msg);
        }

       

        // if(command){
        //     this.runCommand(command, msg);
        // } else {
        //     // Force -tts if bumblebee otherwise don't do anything
        //     if( 
        //         msg.channel instanceof Discord.TextChannel && msg.channel.name.indexOf("bumblebee") >= 0 ){
        //         msg.content = this.env.get('DISCORD_COMMAND_PREFIX') + 'tts ' + msg.content;
        //     }
        // }
           

        // // Force tts when using bumblebee channel
        // if( 
        //     msg.channel instanceof Discord.TextChannel && msg.channel.name.indexOf("bumblebee") >= 0 ){
        //     msg.content = this.env.get('DISCORD_COMMAND_PREFIX') + 'tts ' + msg.content;
        // }
        
        // let command = this.parseCommand(msg);

        // if(command){
        //     command();
        // }
    }

    findCommand(commandName: string): Command | null{
        return this.commands.filter((command: Command) => {
            return command.name === commandName;
        }).shift() as Command | null ?? null;
    }



    // Return Closure to run command if any found
    // parseCommand(msg : Discord.Message) : Command | null {
    //     let prefix = this.env.get('DISCORD_COMMAND_PREFIX');
    //     let content = msg.content;

    //     // Check if we match prefix
    //     if(content.length > prefix.length && content.slice(0,prefix.length) === prefix){
    //         // First parse content to figure out what we are doing
    //         let str = content.substr(prefix.length, content.length - prefix.length).trim().replace(/ +(?= )/g,'');
    //         let parsed = str.split(' ');

    //         if(parsed.length > 0) {
    //             let commandName = parsed.shift();
    //             let target = null as Command | null;
                
    //             // Check our array if we have any items matching the name
    //             let matching = this.commands.filter((command: Command) => {
    //                 return command.name === commandName;
    //             });

    //             if(matching.length > 0) {
    //                 target = matching[0];
    //             }
                                
    //             if(target != null) {
    //                 this.log.debug('Found command ' + target.name);
    //                 // Parse any arguments into the signature of the command
    //                 let signature = target.getSignature();
    //                 let reg = /\{([A-z0-9_\-]+)\}/g;
    //                 let matches = signature.match(reg)?.map((item) => {
    //                     return item.replace('{', '').replace('}','');
    //                 });

    //                 // Transform to map now
    //                 let mappedArgs = new Map<string,string>();
    //                 mappedArgs.set('rawCommand', content);
    //                 mappedArgs.set('rawArguments', parsed.join(' '));
                    
    //                 if(matches !== undefined) {
    //                     for (let index = 0; index < matches.length; index++) {
    //                         const element = matches[index];
    //                         if(parsed[index] != null){
    //                             mappedArgs.set(element, parsed[index]);
    //                         }
    //                     }
    //                 }

    //                 return () => {
    //                     let guildState = this.stagemanager.getByMessage(msg);
    //                     if(guildState){
    //                         this.log.debug('Executing command ' + target?.name);
    //                         target?.execute(msg, mappedArgs, guildState);
    //                     }
    //                 };
    //             }
    //         }
    //     }



    //     return null;
    // }

    runCommand(command: Command, parser: Parser, message: Discord.Message){
        
        // Get arguments from parser
        let args = parser.parseArguments(command);
        command.execute(args, message);
    }

}
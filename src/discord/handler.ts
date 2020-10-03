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

        const parser = new Parser(this.env.get('DISCORD_COMMAND_PREFIX'), msg.content);

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
    }

    findCommand(commandName: string): Command | null{
        return this.commands.filter((command: Command) => {
            return command.name === commandName;
        }).shift() as Command | null ?? null;
    }


    runCommand(command: Command, parser: Parser, message: Discord.Message){
        
        // Get arguments from parser
        const args = parser.parseArguments(command);
        command.execute(args, message);
    }

}
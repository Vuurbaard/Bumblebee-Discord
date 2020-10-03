import { Command } from "./command";
import { CommandArguments } from "./commandArguments";

export class Parser {

    private input: string;
    private prefix: string;

    constructor(prefix: string, input: string){
        this.input = input;
        this.prefix = prefix;
    }

    public getCommandName(): string{
        let rc = '';

        if(this.input.length > this.prefix.length && this.input.slice(0,this.prefix.length) === this.prefix){
            // First parse content to figure out what we are doing
            let str = this.input.substr(this.prefix.length, this.input.length - this.prefix.length).trim().replace(/ +(?= )/g,'');
            let parsed = str.split(' ');
            if(parsed.length > 0){
                rc = parsed.shift() as string;
            }
        }

        return rc;
    }

    public parseArguments(command: Command): CommandArguments {
        let input = this.input;
        let commandName = this.getCommandName();
        let fullCommand = this.prefix + commandName;

        if(commandName.length > 0 && input.length >= fullCommand.length && input.substring(0, fullCommand.length) == fullCommand){
            input = input.substring(fullCommand.length + 1, input.length);
        }

        return new CommandArguments(input, command.getSignature());
    }


}
import { Message } from "discord.js";
import { CommandArguments } from "./commandArguments";

export abstract class Command {
  public name = "";
  public description = "";
  public signature = "";

  public abstract execute(args: CommandArguments, message: Message): void; // Don't return anything.

  public getSignature() {
    return this.signature;
  }
}

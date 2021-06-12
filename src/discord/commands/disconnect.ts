import { Command } from "./command";
import * as Discord from "discord.js";
import { container, injectable } from "tsyringe";
import { Bumblebee } from "../../bumblebee/bumblebee";
import { Log } from "../../app/log";
import { CommandArguments } from "./commandArguments";
import { StateManager } from "../state-manager";

@injectable()
export class Disconnect extends Command {
  public name = "disconnect";
  public description = "";
  public signature = "";
  private bumblebee: Bumblebee;
  private client: Discord.Client;
  private log: Log;

  constructor(bumblebee: Bumblebee, client: Discord.Client, log: Log) {
    super();
    this.bumblebee = bumblebee;
    this.client = client;
    this.log = log;
  }

  public execute(args: CommandArguments, message: Discord.Message): void {
    const stateManager = container.resolve(StateManager);
    const guildState = stateManager.getByMessage(message);
    this.log.info("Disconnect requested by", guildState?.getGuildId());
    if (guildState && guildState.isConnected()) {
      message.reply("👋 Disconnecting as requested");
      guildState.disconnect();
      this.log.info("Sucessfully disconnected", guildState.getGuildId());
    } else {
      this.log.warn(
        "Could not disconnect from voicechannel as we are not connected to any",
        guildState?.getGuildId()
      );
      message.reply(
        "❗ Cannot disconnect as i'm not connected to any voice channel"
      );
    }
  }
}

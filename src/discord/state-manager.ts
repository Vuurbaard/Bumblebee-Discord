import { Message } from "discord.js";
import { singleton } from "tsyringe";
import { GuildState } from "./guild-state";

@singleton()
export class StateManager {
  private guilds: Array<GuildState> = [];

  /**
   * getByMessage
   */
  public getByMessage(msg: Message): GuildState | null {
    let guildState = null;

    const found = this.guilds.filter((guildState: GuildState) => {
      return guildState.getGuildId() == msg.guild?.id;
    });

    if (found.length > 0) {
      guildState = found[0];
    } else {
      if (msg.guild) {
        guildState = new GuildState(msg.guild);
        this.guilds.push(guildState);
      }
    }

    return guildState;
  }
}

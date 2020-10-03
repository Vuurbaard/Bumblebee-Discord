import { GuildState } from "../guild-state";

export interface Queuable {

    run(guildState: GuildState): boolean;
}
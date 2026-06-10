export type GameStatus = 'LOBBY' | 'RUNNING' | 'ENDED';

export type Role = 
  | 'Loup-Garou'
  | 'Voyante'
  | 'Sorcière'
  | 'Chasseur'
  | 'Villageois';

export interface RoleDescription {
  name: Role;
  description: string;
  emoji: string;
}

export interface GameContext {
  guildId: string;
  channelId: string;
  userId: string;
  username: string;
}

export interface VoteResult {
  votedForId: string;
  voteCount: number;
  voters: string[];
}

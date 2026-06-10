import { Guild } from 'discord.js';
export declare class GameService {
    private prisma;
    createGame(guildId: string): Promise<string>;
    getCurrentSession(guildId: string): Promise<({
        players: {
            id: string;
            userId: string;
            gameSessionId: string;
            playerNumber: number | null;
            role: string | null;
            alive: boolean;
            nickname: string | null;
            joinedAt: Date;
        }[];
        roles: {
            id: string;
            gameSessionId: string;
            role: string;
            assignedUserId: string;
        }[];
    } & {
        guildId: string;
        id: string;
        createdAt: Date;
        startedAt: Date | null;
        endedAt: Date | null;
        status: string;
        currentVoteId: string | null;
    }) | null>;
    addPlayer(guildId: string, userId: string, username: string): Promise<boolean>;
    startGame(guildId: string, guild: Guild): Promise<void>;
    resetGame(guildId: string, guild: Guild): Promise<void>;
    private shuffleArray;
}
//# sourceMappingURL=GameService.d.ts.map
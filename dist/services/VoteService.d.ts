import { VoteResult } from '../types/index.js';
export declare class VoteService {
    private prisma;
    recordVote(sessionId: string, voterId: string, votedForId: string, round: number): Promise<void>;
    tallyVotes(sessionId: string, round: number): Promise<VoteResult[]>;
    getAlivePlayers(sessionId: string): Promise<Array<{
        id: string;
        userId: string;
        playerNumber: number | null;
    }>>;
    killPlayer(sessionId: string, playerNumber: number): Promise<void>;
    clearVotes(sessionId: string): Promise<void>;
}
//# sourceMappingURL=VoteService.d.ts.map
export declare class Formatters {
    static formatRoleCount(counts: Record<string, number>): string;
    static formatPlayerList(players: Array<{
        playerNumber: number | null;
        nickname: string | null;
        alive: boolean;
    }>): string;
    static formatVoteResults(results: Array<{
        votedForId: string;
        voteCount: number;
        voters: string[];
    }>): string;
    static formatErrorMessage(message: string): string;
    static formatSuccessMessage(message: string): string;
}
//# sourceMappingURL=formatters.d.ts.map
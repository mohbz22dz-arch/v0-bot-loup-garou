import { Role } from '../types/index.js';
export declare class Validators {
    static validateRoleCounts(counts: Record<string, number>, playerCount: number): boolean;
    static validateAllRolesPresent(counts: Record<string, number>): boolean;
    static validatePlayerNumber(playerNumber: number, maxPlayers: number): boolean;
    static validateVoteRound(round: number): boolean;
    static parseRoleCounts(input: string): Record<Role, number> | null;
}
//# sourceMappingURL=validators.d.ts.map
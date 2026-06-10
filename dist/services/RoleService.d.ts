import { Role, RoleDescription } from '../types/index.js';
import { User } from 'discord.js';
export declare class RoleService {
    private prisma;
    private readonly roleDescriptions;
    assignRoles(sessionId: string, roleCounts: Record<Role, number>, players: Array<{
        id: string;
        userId: string;
    }>, getUser: (userId: string) => Promise<User | null>): Promise<string>;
    private generateRoleReport;
    private shuffleArray;
    getRoleDescription(role: Role): RoleDescription;
}
//# sourceMappingURL=RoleService.d.ts.map
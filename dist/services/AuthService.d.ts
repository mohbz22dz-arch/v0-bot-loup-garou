import { GuildMember } from 'discord.js';
export declare class AuthService {
    static readonly NARRATEUR_ROLE_NAME = "Narrateur";
    static hasNarrateur(member: GuildMember | null): boolean;
    static validateNarrateur(member: GuildMember | null): Promise<boolean>;
}
//# sourceMappingURL=AuthService.d.ts.map
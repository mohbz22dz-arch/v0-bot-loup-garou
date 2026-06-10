import { GuildMember, Role as DiscordRole } from 'discord.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  static readonly NARRATEUR_ROLE_NAME = 'Narrateur';

  static hasNarrateur(member: GuildMember | null): boolean {
    if (!member) {
      logger.warn('Member is null in hasNarrateur check');
      return false;
    }

    const hasRole = member.roles.cache.some(
      (role: DiscordRole) => role.name === this.NARRATEUR_ROLE_NAME
    );

    return hasRole;
  }

  static async validateNarrateur(member: GuildMember | null): Promise<boolean> {
    const isValid = this.hasNarrateur(member);
    if (!isValid) {
      logger.warn(`User ${member?.user.username} attempted privileged action without Narrateur role`);
    }
    return isValid;
  }
}

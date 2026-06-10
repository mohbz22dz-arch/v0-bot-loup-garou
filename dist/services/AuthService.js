import { logger } from '../utils/logger.js';
export class AuthService {
    static hasNarrateur(member) {
        if (!member) {
            logger.warn('Member is null in hasNarrateur check');
            return false;
        }
        const hasRole = member.roles.cache.some((role) => role.name === this.NARRATEUR_ROLE_NAME);
        return hasRole;
    }
    static async validateNarrateur(member) {
        const isValid = this.hasNarrateur(member);
        if (!isValid) {
            logger.warn(`User ${member?.user.username} attempted privileged action without Narrateur role`);
        }
        return isValid;
    }
}
AuthService.NARRATEUR_ROLE_NAME = 'Narrateur';
//# sourceMappingURL=AuthService.js.map
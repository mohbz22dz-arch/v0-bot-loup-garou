import { getPrismaInstance } from '../database/client.js';
import { logger } from '../utils/logger.js';
export class RoleService {
    constructor() {
        this.prisma = getPrismaInstance();
        this.roleDescriptions = {
            'Loup-Garou': {
                name: 'Loup-Garou',
                description: 'You are a werewolf! At night, you and your wolf pack choose who to eliminate.',
                emoji: '🐺'
            },
            'Voyante': {
                name: 'Voyante',
                description: 'You are a seer! Each night, you can see the true role of one player.',
                emoji: '🔮'
            },
            'Sorcière': {
                name: 'Sorcière',
                description: 'You are a witch! You have a potion of life and a potion of death to use once each.',
                emoji: '🧙'
            },
            'Chasseur': {
                name: 'Chasseur',
                description: 'You are a hunter! If you are eliminated, you can shoot one player before you die.',
                emoji: '🏹'
            },
            'Villageois': {
                name: 'Villageois',
                description: 'You are a villager! Vote during the day to eliminate the wolves.',
                emoji: '👤'
            }
        };
    }
    async assignRoles(sessionId, roleCounts, players, getUser) {
        try {
            // Validate total matches player count
            const totalRoles = Object.values(roleCounts).reduce((a, b) => a + b, 0);
            if (totalRoles !== players.length) {
                throw new Error(`Role count (${totalRoles}) doesn't match player count (${players.length})`);
            }
            // Create role array
            const roles = [];
            for (const [role, count] of Object.entries(roleCounts)) {
                for (let i = 0; i < count; i++) {
                    roles.push(role);
                }
            }
            // Shuffle roles
            const shuffledRoles = this.shuffleArray(roles);
            // Assign roles to players
            const assignments = [];
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                const role = shuffledRoles[i];
                await this.prisma.player.update({
                    where: { id: player.id },
                    data: { role }
                });
                assignments.push({
                    playerId: player.id,
                    role,
                    userId: player.userId
                });
                // Send DM to player
                const user = await getUser(player.userId);
                if (user) {
                    const roleInfo = this.roleDescriptions[role];
                    const dmContent = `**Your Role: ${roleInfo.emoji} ${role}**\n\n${roleInfo.description}`;
                    await user.send(dmContent).catch(() => {
                        logger.warn(`Failed to send DM to user ${player.userId}`);
                    });
                }
            }
            logger.info(`Roles assigned for session ${sessionId}`);
            return this.generateRoleReport(assignments);
        }
        catch (error) {
            logger.error('Failed to assign roles', error);
            throw error;
        }
    }
    generateRoleReport(assignments) {
        let report = '**ROLE ASSIGNMENT REPORT**\n```\n';
        report += 'Player # | Role\n';
        report += '--------|-----\n';
        for (const assignment of assignments) {
            const playerNum = assignments.indexOf(assignment) + 1;
            report += `   ${playerNum}    | ${assignment.role}\n`;
        }
        report += '```';
        return report;
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    getRoleDescription(role) {
        return this.roleDescriptions[role];
    }
}
//# sourceMappingURL=RoleService.js.map
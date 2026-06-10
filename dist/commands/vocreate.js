import { SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';
const gameService = new GameService();
export const data = new SlashCommandBuilder()
    .setName('vocreate')
    .setDescription('[ADMIN] Create a new game session')
    .setDefaultMemberPermissions(0);
export async function execute(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        if (!AuthService.hasNarrateur(member || null)) {
            await interaction.editReply(Formatters.formatErrorMessage('You need the Narrateur role to use this command'));
            return;
        }
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.editReply(Formatters.formatErrorMessage('Command must be used in a server'));
            return;
        }
        const sessionId = await gameService.createGame(guildId);
        await interaction.editReply(Formatters.formatSuccessMessage(`Game created! Session ID: ${sessionId}\nPlayers can now join with /vojoin`));
    }
    catch (error) {
        logger.error('Error in vocreate command', error);
        const message = error instanceof Error ? error.message : 'Failed to create game';
        await interaction.editReply(Formatters.formatErrorMessage(message));
    }
}
//# sourceMappingURL=vocreate.js.map
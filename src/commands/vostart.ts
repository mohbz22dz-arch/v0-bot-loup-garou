import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();

export const data = new SlashCommandBuilder()
  .setName('vostart')
  .setDescription('[ADMIN] Start the game - assign seats and shuffle players')
  .setDefaultMemberPermissions(0);

export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!AuthService.hasNarrateur(member || null)) {
      await interaction.editReply(Formatters.formatErrorMessage('You need the Narrateur role to use this command'));
      return;
    }

    const guildId = interaction.guildId;
    const guild = interaction.guild;
    if (!guildId || !guild) {
      await interaction.editReply(Formatters.formatErrorMessage('Command must be used in a server'));
      return;
    }

    await gameService.startGame(guildId, guild);
    
    await interaction.editReply(
      Formatters.formatSuccessMessage('Game started! Players have been assigned seats and renamed.\nUse /voassign to assign roles.')
    );
  } catch (error) {
    logger.error('Error in vostart command', error);
    const message = error instanceof Error ? error.message : 'Failed to start game';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

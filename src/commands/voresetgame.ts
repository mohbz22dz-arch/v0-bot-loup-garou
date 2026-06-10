import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();

export const data = new SlashCommandBuilder()
  .setName('voresetgame')
  .setDescription('[ADMIN] Reset the game - clear all data and restore player nicknames')
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

    await gameService.resetGame(guildId, guild);
    
    await interaction.editReply(
      Formatters.formatSuccessMessage('Game reset! All data cleared and nicknames restored.')
    );
  } catch (error) {
    logger.error('Error in voresetgame command', error);
    const message = error instanceof Error ? error.message : 'Failed to reset game';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();

export const data = new SlashCommandBuilder()
  .setName('vojoin')
  .setDescription('Join the current game lobby');

export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: false });

    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.editReply(Formatters.formatErrorMessage('Command must be used in a server'));
      return;
    }

    const userId = interaction.user.id;
    const username = interaction.user.username;

    await gameService.addPlayer(guildId, userId, username);
    
    await interaction.editReply(
      Formatters.formatSuccessMessage(`${username} joined the game! ✅`)
    );
  } catch (error) {
    logger.error('Error in vojoin command', error);
    const message = error instanceof Error ? error.message : 'Failed to join game';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

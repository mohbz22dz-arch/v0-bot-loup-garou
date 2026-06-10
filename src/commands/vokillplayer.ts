import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { VoteService } from '../services/VoteService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { Validators } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();
const voteService = new VoteService();

export const data = new SlashCommandBuilder()
  .setName('vokillplayer')
  .setDescription('[ADMIN] Eliminate a player')
  .addIntegerOption(option =>
    option
      .setName('player_number')
      .setDescription('Player number to eliminate')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(0);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
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

    const playerNumber = interaction.options.getInteger('player_number', true);

    const session = await gameService.getCurrentSession(guildId);
    if (!session) {
      await interaction.editReply(Formatters.formatErrorMessage('No active game session'));
      return;
    }

    if (!Validators.validatePlayerNumber(playerNumber, session.players.length)) {
      await interaction.editReply(
        Formatters.formatErrorMessage(`Invalid player number. Valid range: 1-${session.players.length}`)
      );
      return;
    }

    await voteService.killPlayer(session.id, playerNumber);
    
    await interaction.editReply(
      Formatters.formatSuccessMessage(`Player ${playerNumber} has been eliminated.`)
    );

    logger.info(`Player ${playerNumber} eliminated in session ${session.id}`);
  } catch (error) {
    logger.error('Error in vokillplayer command', error);
    const message = error instanceof Error ? error.message : 'Failed to eliminate player';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

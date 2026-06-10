import {
  SlashCommandBuilder,
  CommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder
} from 'discord.js';
import { GameService } from '../services/GameService.js';
import { VoteService } from '../services/VoteService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();
const voteService = new VoteService();

export const data = new SlashCommandBuilder()
  .setName('vostartvote')
  .setDescription('[ADMIN] Start a voting round with interactive selection')
  .setDefaultMemberPermissions(0);

export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    await interaction.deferReply({ ephemeral: false });

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

    const session = await gameService.getCurrentSession(guildId);
    if (!session) {
      await interaction.editReply(Formatters.formatErrorMessage('No active game session'));
      return;
    }

    // Get alive players
    const alivePlayers = await voteService.getAlivePlayers(session.id);
    if (alivePlayers.length === 0) {
      await interaction.editReply(Formatters.formatErrorMessage('No alive players to vote for'));
      return;
    }

    // Create select menu with alive players
    const options = alivePlayers.map(player =>
      new StringSelectMenuOptionBuilder()
        .setLabel(`Player ${player.playerNumber}`)
        .setValue(player.userId)
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`vote_${session.id}`)
      .setPlaceholder('Select a player to vote for')
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🗳️ VOTING TIME')
      .setDescription('Select the player you want to eliminate!')
      .addFields([
        {
          name: 'Alive Players',
          value: alivePlayers.map(p => `Player ${p.playerNumber}`).join(', ')
        }
      ]);

    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });

    logger.info(`Voting started for session ${session.id}`);
  } catch (error) {
    logger.error('Error in vostartvote command', error);
    const message = error instanceof Error ? error.message : 'Failed to start voting';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

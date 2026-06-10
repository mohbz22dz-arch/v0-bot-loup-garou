import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();

export const data = new SlashCommandBuilder()
  .setName('voshowplayer')
  .setDescription('[ADMIN] Display current player roster with status')
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
    if (!guildId) {
      await interaction.editReply(Formatters.formatErrorMessage('Command must be used in a server'));
      return;
    }

    const session = await gameService.getCurrentSession(guildId);
    if (!session) {
      await interaction.editReply(Formatters.formatErrorMessage('No active game session'));
      return;
    }

    // Build player roster
    let roster = '**PLAYER ROSTER**\n```\n';
    roster += 'Player # | Status\n';
    roster += '---------|--------\n';

    const sortedPlayers = session.players.sort((a, b) => (a.playerNumber || 0) - (b.playerNumber || 0));

    for (const player of sortedPlayers) {
      const status = player.alive ? 'Alive ✓' : 'Dead ✗';
      roster += `   ${player.playerNumber}     | ${status}\n`;
    }

    roster += '```';

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(session.players.some(p => !p.alive) ? '#FF0000' : '#00FF00')
      .setTitle('👥 Player Roster')
      .setDescription(roster)
      .addFields([
        {
          name: 'Total Players',
          value: `${session.players.length}`,
          inline: true
        },
        {
          name: 'Alive',
          value: `${session.players.filter(p => p.alive).length}`,
          inline: true
        },
        {
          name: 'Dead',
          value: `${session.players.filter(p => !p.alive).length}`,
          inline: true
        }
      ]);

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Player roster displayed for session ${session.id}`);
  } catch (error) {
    logger.error('Error in voshowplayer command', error);
    const message = error instanceof Error ? error.message : 'Failed to display player roster';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

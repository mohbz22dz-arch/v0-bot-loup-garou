import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { RoleService } from '../services/RoleService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { Validators } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

const gameService = new GameService();
const roleService = new RoleService();

export const data = new SlashCommandBuilder()
  .setName('voassign')
  .setDescription('[ADMIN] Assign roles to players')
  .addStringOption(option =>
    option
      .setName('roles')
      .setDescription('Role counts (e.g., "2 Loup-Garou, 1 Voyante, 2 Sorcière, 1 Chasseur, 3 Villageois")')
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

    const roleInput = interaction.options.getString('roles', true);
    const roleCounts = Validators.parseRoleCounts(roleInput);

    if (!roleCounts) {
      await interaction.editReply(
        Formatters.formatErrorMessage(
          'Invalid role format. Use: "2 Loup-Garou, 1 Voyante, 2 Sorcière, 1 Chasseur, 3 Villageois"'
        )
      );
      return;
    }

    const session = await gameService.getCurrentSession(guildId);
    if (!session) {
      await interaction.editReply(Formatters.formatErrorMessage('No active game session'));
      return;
    }

    if (!Validators.validateRoleCounts(roleCounts, session.players.length)) {
      await interaction.editReply(
        Formatters.formatErrorMessage(
          `Role count (${Object.values(roleCounts).reduce((a, b) => a + b, 0)}) doesn't match player count (${session.players.length})`
        )
      );
      return;
    }

    const report = await roleService.assignRoles(
      session.id,
      roleCounts,
      session.players,
      async (userId) => interaction.client.users.fetch(userId).catch(() => null)
    );

    // Send report to Narrateur via DM
    await interaction.user.send(report).catch(() => {
      logger.warn('Failed to send role report to Narrateur');
    });

    await interaction.editReply(
      Formatters.formatSuccessMessage('Roles assigned! Check your DMs for the role assignment report.')
    );
  } catch (error) {
    logger.error('Error in voassign command', error);
    const message = error instanceof Error ? error.message : 'Failed to assign roles';
    await interaction.editReply(Formatters.formatErrorMessage(message));
  }
}

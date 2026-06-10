import { SlashCommandBuilder } from 'discord.js';
import { GameService } from '../services/GameService.js';
import { VoteService } from '../services/VoteService.js';
import { AuthService } from '../services/AuthService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';
import { getPrismaInstance } from '../database/client.js';
const gameService = new GameService();
const voteService = new VoteService();
const prisma = getPrismaInstance();
export const data = new SlashCommandBuilder()
    .setName('voendvote')
    .setDescription('[ADMIN] End voting and reveal results')
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
        const session = await gameService.getCurrentSession(guildId);
        if (!session) {
            await interaction.editReply(Formatters.formatErrorMessage('No active game session'));
            return;
        }
        // Tally votes for round 1
        const voteResults = await voteService.tallyVotes(session.id, 1);
        if (voteResults.length === 0) {
            await interaction.editReply(Formatters.formatErrorMessage('No votes were cast'));
            return;
        }
        // Find player with most votes (first in sorted array)
        const mostVotedUserId = voteResults[0].votedForId;
        // Get player number for the most voted player
        const votedPlayer = await prisma.player.findFirst({
            where: { userId: mostVotedUserId, gameSessionId: session.id }
        });
        if (!votedPlayer || votedPlayer.playerNumber === null) {
            await interaction.editReply(Formatters.formatErrorMessage('Could not determine voted player'));
            return;
        }
        // Generate report
        let report = '**VOTING RESULTS**\n```\n';
        report += 'Player | Votes\n';
        report += '--------|------\n';
        for (const result of voteResults) {
            const player = session.players.find(p => p.userId === result.votedForId);
            if (player) {
                report += `  ${player.playerNumber}    |  ${result.voteCount}\n`;
            }
        }
        report += '```\n';
        report += `**Most voted: Player ${votedPlayer.playerNumber} (${voteResults[0].voteCount} votes)**`;
        // Send report to Narrateur via DM
        await interaction.user.send(report).catch(() => {
            logger.warn('Failed to send vote results to Narrateur');
        });
        await interaction.editReply(Formatters.formatSuccessMessage(`Voting ended! Player ${votedPlayer.playerNumber} received the most votes (${voteResults[0].voteCount}). Check your DMs for details.`));
        logger.info(`Voting ended for session ${session.id}`);
    }
    catch (error) {
        logger.error('Error in voendvote command', error);
        const message = error instanceof Error ? error.message : 'Failed to end voting';
        await interaction.editReply(Formatters.formatErrorMessage(message));
    }
}
//# sourceMappingURL=voendvote.js.map
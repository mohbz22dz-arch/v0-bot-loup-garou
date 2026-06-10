import { VoteService } from '../services/VoteService.js';
import { GameService } from '../services/GameService.js';
import { Formatters } from '../utils/formatters.js';
import { logger } from '../utils/logger.js';
import * as vojoin from '../commands/vojoin.js';
import * as vocreate from '../commands/vocreate.js';
import * as vostart from '../commands/vostart.js';
import * as voassign from '../commands/voassign.js';
import * as voresetgame from '../commands/voresetgame.js';
import * as vostartvote from '../commands/vostartvote.js';
import * as voendvote from '../commands/voendvote.js';
import * as vokillplayer from '../commands/vokillplayer.js';
import * as voshowplayer from '../commands/voshowplayer.js';
const voteService = new VoteService();
const gameService = new GameService();
const commands = {
    vojoin,
    vocreate,
    vostart,
    voassign,
    voresetgame,
    vostartvote,
    voendvote,
    vokillplayer,
    voshowplayer
};
export async function execute(interaction) {
    try {
        if (interaction.isCommand()) {
            const command = commands[interaction.commandName];
            if (command) {
                await command.execute(interaction);
            }
        }
        else if (interaction.isStringSelectMenu()) {
            // Handle voting selection
            if (interaction.customId.startsWith('vote_')) {
                const sessionId = interaction.customId.replace('vote_', '');
                const selectedUserId = interaction.values[0];
                try {
                    const session = await gameService.getCurrentSession(interaction.guildId);
                    if (!session || session.id !== sessionId) {
                        await interaction.reply({
                            content: Formatters.formatErrorMessage('Voting session not found'),
                            ephemeral: true
                        });
                        return;
                    }
                    await voteService.recordVote(sessionId, interaction.user.id, selectedUserId, 1);
                    const selectedPlayer = session.players.find(p => p.userId === selectedUserId);
                    await interaction.reply({
                        content: Formatters.formatSuccessMessage(`You voted for Player ${selectedPlayer?.playerNumber || '?'}!`),
                        ephemeral: true
                    });
                    logger.info(`Vote recorded: ${interaction.user.username} → Player ${selectedPlayer?.playerNumber}`);
                }
                catch (error) {
                    logger.error('Failed to record vote', error);
                    const message = error instanceof Error ? error.message : 'Failed to record vote';
                    await interaction.reply({
                        content: Formatters.formatErrorMessage(message),
                        ephemeral: true
                    });
                }
            }
        }
    }
    catch (error) {
        logger.error('Error handling interaction', error);
    }
}
//# sourceMappingURL=interactionCreate.js.map
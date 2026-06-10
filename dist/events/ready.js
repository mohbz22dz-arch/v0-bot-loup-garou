import { REST, Routes } from 'discord.js';
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
const commands = [
    vojoin,
    vocreate,
    vostart,
    voassign,
    voresetgame,
    vostartvote,
    voendvote,
    vokillplayer,
    voshowplayer
];
export async function execute(client) {
    logger.info(`✅ Bot is ready! Logged in as ${client.user?.tag}`);
    try {
        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;
        if (!clientId || !guildId) {
            throw new Error('Missing CLIENT_ID or GUILD_ID environment variables');
        }
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');
        logger.info('Registering slash commands...');
        const commandData = commands.map(cmd => cmd.data.toJSON());
        const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandData });
        logger.info(`✅ Successfully registered ${data.length} slash commands`);
    }
    catch (error) {
        logger.error('Failed to register commands', error);
    }
}
//# sourceMappingURL=ready.js.map
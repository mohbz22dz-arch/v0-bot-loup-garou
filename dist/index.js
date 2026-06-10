import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { getPrismaInstance, disconnectPrisma } from './database/client.js';
import { logger } from './utils/logger.js';
import * as readyEvent from './events/ready.js';
import * as interactionCreateEvent from './events/interactionCreate.js';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});
// Initialize Prisma
const prisma = getPrismaInstance();
// Event handlers
client.on(Events.ClientReady, () => readyEvent.execute(client));
client.on(Events.InteractionCreate, (interaction) => interactionCreateEvent.execute(interaction));
client.on(Events.Error, (error) => {
    logger.error('Discord client error', error);
});
client.on(Events.Warn, (warning) => {
    logger.warn('Discord client warning', warning);
});
// Login
async function start() {
    try {
        const token = process.env.DISCORD_TOKEN;
        if (!token) {
            throw new Error('DISCORD_TOKEN environment variable is not set');
        }
        logger.info('Starting Loups-Garous Discord Bot...');
        await client.login(token);
    }
    catch (error) {
        logger.error('Failed to start bot', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    await client.destroy();
    await disconnectPrisma();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger.info('Shutting down gracefully...');
    await client.destroy();
    await disconnectPrisma();
    process.exit(0);
});
start();
//# sourceMappingURL=index.js.map
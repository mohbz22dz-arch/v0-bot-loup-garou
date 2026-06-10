import { getPrismaInstance } from '../database/client.js';
import { logger } from '../utils/logger.js';
import { Guild, GuildMember, Collection } from 'discord.js';

export class GameService {
  private prisma = getPrismaInstance();

  async createGame(guildId: string): Promise<string> {
    try {
      // End any existing game session
      await this.prisma.gameSession.updateMany({
        where: { guildId, status: { not: 'ENDED' } },
        data: { status: 'ENDED', endedAt: new Date() }
      });

      // Create new session
      const session = await this.prisma.gameSession.create({
        data: {
          guildId,
          status: 'LOBBY'
        }
      });

      logger.info(`Game created for guild ${guildId}`, { sessionId: session.id });
      return session.id;
    } catch (error) {
      logger.error('Failed to create game', error);
      throw error;
    }
  }

  async getCurrentSession(guildId: string) {
    try {
      const session = await this.prisma.gameSession.findFirst({
        where: { guildId, status: { not: 'ENDED' } },
        include: { players: true, roles: true }
      });
      return session;
    } catch (error) {
      logger.error('Failed to get current session', error);
      throw error;
    }
  }

  async addPlayer(guildId: string, userId: string, username: string): Promise<boolean> {
    try {
      const session = await this.getCurrentSession(guildId);
      if (!session) {
        throw new Error('No active game session');
      }

      if (session.status !== 'LOBBY') {
        throw new Error('Game is not in lobby phase');
      }

      // Check if player already joined
      const existing = await this.prisma.player.findFirst({
        where: { userId, gameSessionId: session.id }
      });

      if (existing) {
        throw new Error('Player already joined');
      }

      // Add player
      await this.prisma.player.create({
        data: {
          userId,
          gameSessionId: session.id,
          nickname: username
        }
      });

      logger.info(`Player ${username} (${userId}) joined game ${session.id}`);
      return true;
    } catch (error) {
      logger.error('Failed to add player', error);
      throw error;
    }
  }

  async startGame(guildId: string, guild: Guild): Promise<void> {
    try {
      const session = await this.getCurrentSession(guildId);
      if (!session) {
        throw new Error('No active game session');
      }

      // Get all players
      const players = await this.prisma.player.findMany({
        where: { gameSessionId: session.id },
        orderBy: { joinedAt: 'asc' }
      });

      if (players.length === 0) {
        throw new Error('No players in game');
      }

      // Shuffle and assign player numbers
      const shuffled = this.shuffleArray([...players]);
      
      for (let i = 0; i < shuffled.length; i++) {
        const playerNumber = i + 1;
        
        // Update player with number
        await this.prisma.player.update({
          where: { id: shuffled[i].id },
          data: { playerNumber }
        });

        // Rename member in Discord
        const member = await guild.members.fetch(shuffled[i].userId).catch(() => null);
        if (member) {
          await member.setNickname(`${playerNumber}`).catch(() => {
            logger.warn(`Failed to rename member ${shuffled[i].userId} to ${playerNumber}`);
          });
        }
      }

      // Update session status
      await this.prisma.gameSession.update({
        where: { id: session.id },
        data: { status: 'RUNNING', startedAt: new Date() }
      });

      logger.info(`Game started for guild ${guildId} with ${players.length} players`);
    } catch (error) {
      logger.error('Failed to start game', error);
      throw error;
    }
  }

  async resetGame(guildId: string, guild: Guild): Promise<void> {
    try {
      const session = await this.getCurrentSession(guildId);
      if (!session) {
        throw new Error('No active game session');
      }

      // Get all players to reset nicknames
      const players = await this.prisma.player.findMany({
        where: { gameSessionId: session.id }
      });

      for (const player of players) {
        const member = await guild.members.fetch(player.userId).catch(() => null);
        if (member) {
          await member.setNickname(null).catch(() => {
            logger.warn(`Failed to reset nickname for member ${player.userId}`);
          });
        }
      }

      // Delete the session and all related data
      await this.prisma.gameSession.delete({
        where: { id: session.id }
      });

      logger.info(`Game reset for guild ${guildId}`);
    } catch (error) {
      logger.error('Failed to reset game', error);
      throw error;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

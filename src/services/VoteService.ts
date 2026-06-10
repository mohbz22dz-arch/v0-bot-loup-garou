import { getPrismaInstance } from '../database/client.js';
import { VoteResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class VoteService {
  private prisma = getPrismaInstance();

  async recordVote(sessionId: string, voterId: string, votedForId: string, round: number): Promise<void> {
    try {
      // Check if voter is alive
      const voter = await this.prisma.player.findFirst({
        where: { userId: voterId }
      });

      if (!voter || !voter.alive) {
        throw new Error('Dead players cannot vote');
      }

      // Remove previous vote from this voter in this round
      await this.prisma.vote.deleteMany({
        where: {
          gameSessionId: sessionId,
          voterId,
          voteRound: round
        }
      });

      // Record new vote
      await this.prisma.vote.create({
        data: {
          gameSessionId: sessionId,
          voterId,
          votedForId,
          voteRound: round
        }
      });

      logger.info(`Vote recorded: ${voterId} → ${votedForId}`);
    } catch (error) {
      logger.error('Failed to record vote', error);
      throw error;
    }
  }

  async tallyVotes(sessionId: string, round: number): Promise<VoteResult[]> {
    try {
      const votes = await this.prisma.vote.findMany({
        where: {
          gameSessionId: sessionId,
          voteRound: round
        }
      });

      const tally: Record<string, { count: number; voters: string[] }> = {};

      for (const vote of votes) {
        if (!tally[vote.votedForId]) {
          tally[vote.votedForId] = { count: 0, voters: [] };
        }
        tally[vote.votedForId].count++;
        tally[vote.votedForId].voters.push(vote.voterId);
      }

      const results: VoteResult[] = Object.entries(tally)
        .map(([votedForId, data]) => ({
          votedForId,
          voteCount: data.count,
          voters: data.voters
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

      logger.info(`Tally complete for round ${round}`, { results });
      return results;
    } catch (error) {
      logger.error('Failed to tally votes', error);
      throw error;
    }
  }

  async getAlivePlayers(sessionId: string): Promise<Array<{ id: string; userId: string; playerNumber: number | null }>> {
    try {
      const players = await this.prisma.player.findMany({
        where: {
          gameSessionId: sessionId,
          alive: true
        },
        select: { id: true, userId: true, playerNumber: true }
      });
      return players;
    } catch (error) {
      logger.error('Failed to get alive players', error);
      throw error;
    }
  }

  async killPlayer(sessionId: string, playerNumber: number): Promise<void> {
    try {
      const player = await this.prisma.player.findFirst({
        where: {
          gameSessionId: sessionId,
          playerNumber
        }
      });

      if (!player) {
        throw new Error('Player not found');
      }

      await this.prisma.player.update({
        where: { id: player.id },
        data: { alive: false }
      });

      logger.info(`Player ${playerNumber} eliminated`);
    } catch (error) {
      logger.error('Failed to kill player', error);
      throw error;
    }
  }

  async clearVotes(sessionId: string): Promise<void> {
    try {
      await this.prisma.vote.deleteMany({
        where: { gameSessionId: sessionId }
      });
      logger.info(`Votes cleared for session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to clear votes', error);
      throw error;
    }
  }
}

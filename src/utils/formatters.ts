import { Role } from '../types/index.js';

export class Formatters {
  static formatRoleCount(counts: Record<string, number>): string {
    return Object.entries(counts)
      .map(([role, count]) => `${count} ${role}${count > 1 ? 's' : ''}`)
      .join(', ');
  }

  static formatPlayerList(players: Array<{ playerNumber: number | null; nickname: string | null; alive: boolean }>): string {
    let list = '```\nPlayer | Status\n--------|-------\n';
    for (const player of players) {
      const status = player.alive ? 'Alive' : 'Dead';
      list += `  ${player.playerNumber}    | ${status}\n`;
    }
    list += '```';
    return list;
  }

  static formatVoteResults(results: Array<{ votedForId: string; voteCount: number; voters: string[] }>): string {
    let report = '**VOTING RESULTS**\n```\n';
    report += 'Player | Votes\n';
    report += '--------|------\n';

    for (const result of results) {
      report += `  ${result.votedForId}  |  ${result.voteCount}\n`;
    }

    report += '```';
    return report;
  }

  static formatErrorMessage(message: string): string {
    return `❌ **Error:** ${message}`;
  }

  static formatSuccessMessage(message: string): string {
    return `✅ ${message}`;
  }
}

import { Role } from '../types/index.js';

export class Validators {
  static validateRoleCounts(counts: Record<string, number>, playerCount: number): boolean {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return total === playerCount;
  }

  static validateAllRolesPresent(counts: Record<string, number>): boolean {
    const roles: Role[] = ['Loup-Garou', 'Voyante', 'Sorcière', 'Chasseur', 'Villageois'];
    for (const role of roles) {
      if (!(role in counts)) {
        return false;
      }
    }
    return true;
  }

  static validatePlayerNumber(playerNumber: number, maxPlayers: number): boolean {
    return playerNumber > 0 && playerNumber <= maxPlayers;
  }

  static validateVoteRound(round: number): boolean {
    return round > 0;
  }

  static parseRoleCounts(input: string): Record<Role, number> | null {
    try {
      // Expected format: "2 Loup-Garou, 1 Voyante, 2 Sorcière, 1 Chasseur, 5 Villageois"
      const counts: Record<string, number> = {};
      const parts = input.split(',').map(p => p.trim());

      for (const part of parts) {
        const match = part.match(/^(\d+)\s+(.+)$/);
        if (!match) {
          return null;
        }

        const count = parseInt(match[1]);
        let role = match[2];

        // Handle plural forms
        if (role.endsWith('s')) {
          role = role.slice(0, -1);
        }

        counts[role] = count;
      }

      return counts as Record<Role, number>;
    } catch {
      return null;
    }
  }
}

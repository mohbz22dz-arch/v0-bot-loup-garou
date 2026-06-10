export class Formatters {
    static formatRoleCount(counts) {
        return Object.entries(counts)
            .map(([role, count]) => `${count} ${role}${count > 1 ? 's' : ''}`)
            .join(', ');
    }
    static formatPlayerList(players) {
        let list = '```\nPlayer | Status\n--------|-------\n';
        for (const player of players) {
            const status = player.alive ? 'Alive' : 'Dead';
            list += `  ${player.playerNumber}    | ${status}\n`;
        }
        list += '```';
        return list;
    }
    static formatVoteResults(results) {
        let report = '**VOTING RESULTS**\n```\n';
        report += 'Player | Votes\n';
        report += '--------|------\n';
        for (const result of results) {
            report += `  ${result.votedForId}  |  ${result.voteCount}\n`;
        }
        report += '```';
        return report;
    }
    static formatErrorMessage(message) {
        return `❌ **Error:** ${message}`;
    }
    static formatSuccessMessage(message) {
        return `✅ ${message}`;
    }
}
//# sourceMappingURL=formatters.js.map
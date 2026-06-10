# Loups-Garous Discord Bot

A fully-featured Discord bot for hosting the Loups-Garous (Werewolf) game in your Discord server.

## Features

- 🎮 Complete game management system
- 👥 Player management with automatic seat assignment
- 🎭 Role assignment with DM notifications
- 🗳️ Interactive voting system with Discord Select Menus
- 💾 Full game history tracking with SQLite
- 🔐 Role-based access control (Narrateur role)
- 📝 Detailed vote and role reports

## Requirements

- Node.js 16+ and pnpm
- Discord bot token and application ID
- Discord server (guild) for testing

## Setup Instructions

### 1. Clone or Extract the Project

```bash
cd bot-loup-garou
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and fill in your Discord credentials:

```
DATABASE_URL="file:./dev.db"
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

**How to get these values:**

1. **DISCORD_TOKEN**: Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and click "Add Bot"
   - Copy the token under "TOKEN"

2. **CLIENT_ID**: In the same Developer Portal
   - Go to "General Information"
   - Copy the "APPLICATION ID"

3. **GUILD_ID**: In your Discord server
   - Enable Developer Mode (Settings → App Settings → Advanced → Developer Mode)
   - Right-click your server name and select "Copy Server ID"

### 4. Generate Prisma Client

```bash
pnpm exec prisma generate
```

### 5. Push Database Schema

```bash
pnpm exec prisma db push
```

### 6. Invite Bot to Your Server

1. Go to Discord Developer Portal
2. Select your application
3. Go to OAuth2 → URL Generator
4. Select scopes: `bot`, `applications.commands`
5. Select permissions: `Manage Nicknames`, `Send Messages`, `Use Slash Commands`
6. Copy the generated URL and open it to invite the bot

### 7. Create the "Narrateur" Role

1. In your Discord server, create a new role called exactly **"Narrateur"**
2. Assign this role to the user(s) who should be able to run admin commands
3. Give the role appropriate permissions

### 8. Start the Bot

```bash
pnpm dev
```

You should see:
```
[INFO] Starting Loups-Garous Discord Bot...
[INFO] ✅ Bot is ready! Logged in as YourBotName#0000
[INFO] Registering slash commands...
[INFO] ✅ Successfully registered 9 slash commands
```

## Command Reference

### Public Commands

**`/vojoin`** - Join the current game lobby
- Usage: Just type `/vojoin` in any channel
- Result: You'll be added to the player list for the current game

### Admin Commands (Requires "Narrateur" Role)

**`/vocreate`** - Create a new game session
- Usage: `/vocreate`
- Result: Creates a new game lobby where players can join

**`/vostart`** - Start the game and assign seats
- Usage: `/vostart`
- Prerequisites: At least 1 player must have joined
- Result: Shuffles players, assigns seat numbers (1, 2, 3...), and renames their Discord nicknames

**`/voassign [roles]`** - Assign roles to players
- Usage: `/voassign roles: 2 Loup-Garou, 1 Voyante, 2 Sorcière, 1 Chasseur, 2 Villageois`
- Prerequisites: `/vostart` must have been run
- Result: Randomly distributes roles and sends DM to each player with their role
- Sends role assignment report to Narrateur via DM

**`/vostartvote`** - Start a voting round
- Usage: `/vostartvote`
- Result: Posts an interactive voting interface where alive players can vote
- Players can change their vote before voting ends

**`/voendvote`** - End voting and reveal results
- Usage: `/voendvote`
- Result: Tallies all votes, announces the most-voted player, and sends detailed report to Narrateur

**`/vokillplayer [player_number]`** - Eliminate a player
- Usage: `/vokillplayer player_number: 3`
- Result: Marks the player as dead (they can no longer vote)

**`/voshowplayer`** - Display current player roster
- Usage: `/voshowplayer`
- Result: Shows all players with their status (Alive/Dead)

**`/voresetgame`** - Reset the entire game
- Usage: `/voresetgame`
- Result: Clears all game data, restores Discord nicknames, returns to fresh state

## Game Flow Example

1. Narrateur creates game: `/vocreate`
2. Players join: `/vojoin` (repeat for each player)
3. Narrateur starts game: `/vostart`
4. Narrateur assigns roles: `/voassign roles: 2 Loup-Garou, 1 Voyante, 2 Sorcière, 1 Chasseur, 1 Villageois`
5. Players receive DMs with their roles
6. Game plays out...
7. During voting: `/vostartvote` → players vote → `/voendvote`
8. Narrateur eliminates voted player: `/vokillplayer player_number: 3`
9. Repeat voting phases as needed
10. After game: `/voresetgame` to start fresh

## Database Schema

The bot uses SQLite with Prisma ORM. Data is stored in `dev.db`:

- **GameSession** - Game state and metadata
- **Player** - Player information, roles, alive status
- **Vote** - Complete voting history with voter/votee tracking
- **RoleAssignment** - Role configuration for each game

## Troubleshooting

**Bot doesn't appear online:**
- Check if DISCORD_TOKEN is correct
- Verify bot is invited to the server
- Check bot has "Bot" scope in OAuth2

**Commands don't show up:**
- Make sure CLIENT_ID and GUILD_ID are correct
- Check bot has "applications.commands" scope
- Wait a minute for commands to sync
- Try restarting the bot: `Ctrl+C` then `pnpm dev`

**"You need the Narrateur role" error:**
- Create a role called exactly "Narrateur" in your server
- Assign it to your user
- Restart the bot

**Players can't vote:**
- Make sure voting was started with `/vostartvote`
- Check the player is alive (use `/voshowplayer`)
- Ensure they haven't already voted (can vote once per round)

**Database issues:**
- Delete `dev.db` and re-run: `pnpm exec prisma db push`

## Development

### Project Structure

```
src/
├── commands/           # Slash command implementations
├── events/            # Discord event handlers
├── services/          # Game logic (GameService, VoteService, etc.)
├── database/          # Database client setup
├── types/             # TypeScript type definitions
├── utils/             # Utilities (logger, formatters, validators)
└── index.ts           # Bot entry point

prisma/
└── schema.prisma      # Database schema
```

### Running in Development

```bash
pnpm dev
```

This starts the bot with hot-reload using tsx watch.

### Building for Production

```bash
pnpm build
pnpm start
```

## Features Details

### Role System

5 roles with distinct gameplay mechanics:
- **Loup-Garou** 🐺 - Eliminate players at night
- **Voyante** 🔮 - See one player's role each night
- **Sorcière** 🧙 - Use potions to save or eliminate
- **Chasseur** 🏹 - Shoot a player when eliminated
- **Villageois** 👤 - Vote during the day

### Voting System

- Interactive Discord Select Menu for voting
- Players can change their vote before voting ends
- Dead players automatically excluded from voting
- Complete vote history tracked in database
- Vote tally with detailed breakdown

### Security

- All secrets use environment variables
- Narrateur role verification on admin commands
- Ephemeral (private) error messages for unauthorized access
- Role information only sent via DM, never posted publicly
- Input validation on all user inputs

## Support & Contributions

For issues or feature requests, please refer to the documentation or adjust the code as needed for your use case.

## License

This bot is provided as-is for personal use.

# Quick Start Guide - Loups-Garous Discord Bot

## 5-Minute Setup

### Step 1: Environment Variables
Edit `.env` with your Discord credentials:
```
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
GUILD_ID=your_server_id
```

### Step 2: Create Narrateur Role
In your Discord server, create a role named **exactly** "Narrateur" and assign it to yourself.

### Step 3: Start the Bot
```bash
pnpm install    # First time only
pnpm dev        # Start the bot
```

### Step 4: Use the Bot
1. **/vojoin** - Have players join the game
2. **/vostart** - Shuffle and assign seats
3. **/voassign** - Assign roles (use format below)
4. **/vostartvote** - Players vote
5. **/voendvote** - Reveal results
6. **/vokillplayer** - Eliminate players
7. **/voresetgame** - Start over

## Role Assignment Example

```
/voassign roles: 2 Loup-Garou, 1 Voyante, 2 Sorcière, 1 Chasseur, 2 Villageois
```

Total roles must equal number of players.

## All Commands

### Public
- `/vojoin` - Join game

### Admin Only (Narrateur role required)
- `/vocreate` - New game
- `/vostart` - Shuffle players
- `/voassign` - Assign roles
- `/vostartvote` - Start voting
- `/voendvote` - End voting
- `/vokillplayer` - Kill player
- `/voshowplayer` - Show roster
- `/voresetgame` - Reset game

## Getting Discord Credentials

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Copy APPLICATION ID → **CLIENT_ID**
4. Go to "Bot" section, click "Add Bot"
5. Copy TOKEN → **DISCORD_TOKEN**
6. OAuth2 → URL Generator
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Manage Nicknames`, `Send Messages`
   - Use generated URL to invite bot

7. In your server (Developer Mode on):
   - Right-click server → Copy ID → **GUILD_ID**

## Troubleshooting

- Commands not showing? Restart: `Ctrl+C` then `pnpm dev`
- "Need Narrateur role"? Create role named exactly "Narrateur"
- Bot offline? Check DISCORD_TOKEN in .env

See README.md for full documentation.

const { REST, Routes, Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
] });

const fs = require('node:fs');
const config = require('./config.json');

// Set up MySQL
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Exports for Config and DB
client.db = db;
client.config = config;

// Register the commands
const commands = [];
client.commands = new Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
	    // Ensure the command has the correct properties
	    if ('data' in command && 'execute' in command) {
            // Register the command
	    	client.commands.set(command.data.name, command);
	    } else {
            // Log the error
	    	console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	    }
    }
}
// Register the events in the events folder
const eventFiles = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Create a new Discord REST instance
const rest = new REST({ version: '10' }).setToken(config.token);

// Register the commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Send the commands to the Discord API
		const data = await rest.put(
			Routes.applicationCommands(config.clientid),
			{ body: commands },
		);
        
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
        // Log the error
		console.error(error);
	}
})();

// Login to Discord
client.login(config.token);

// Register the managers
const WarnManager = require('./managers/warnmanager.js');
const SettingsManager = require('./managers/settingsmanager.js');
const CooldownManager = require('./managers/cooldownmanager.js');
const TicketManager = require('./managers/ticketmanager.js');
client.warnManager = new WarnManager(client);
client.settingsManager = new SettingsManager(client);
client.cooldownManager = new CooldownManager(client);
client.ticketManager = new TicketManager(client);

// Utility function to update stats for a single guild
async function updateGuildStats(guild, settings) {
    await guild.members.fetch(); // Fetch all members to populate the cache

    if (settings.memberstatschannel) {
        const channel = guild.channels.cache.get(settings.memberstatschannel);
        if (channel && channel.guild.id === guild.id) {
            channel.setName(`All Members: ${guild.members.cache.size}`);
        }
    }

    if (settings.userstatschannel) {
        const channel = guild.channels.cache.get(settings.userstatschannel);
        if (channel && channel.guild.id === guild.id) {
            channel.setName(`Users: ${guild.members.cache.filter(member => !member.user.bot).size}`);
        }
    }

    if (settings.botstatschannel) {
        const channel = guild.channels.cache.get(settings.botstatschannel);
        if (channel && channel.guild.id === guild.id) {
            channel.setName(`Bots: ${guild.members.cache.filter(member => member.user.bot).size}`);
        }
    }
}

// Update all guild stats periodically
async function updateAllGuilds() {
    for (const guild of client.guilds.cache.values()) {
        try {
            const settings = await client.settingsManager.getSettings(guild);
            await updateGuildStats(guild, settings);
        } catch (err) {
            console.error(`Error updating stats for guild ${guild.id}:`, err);
        }
        await delay(1000); // Delay to avoid rate limits
    }

    console.log('All guild stats updated');
    setTimeout(updateAllGuilds, 5 * 60 * 1000); // Schedule the next run
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('ready', () => {
    updateAllGuilds();
});
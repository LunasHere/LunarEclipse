const { REST, Routes, Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
] });

const fs = require('node:fs');
const config = require('./config.json');

// Set up MySQL
const mysql = require('mysql');
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
client.warnManager = new WarnManager(client);
client.settingsManager = new SettingsManager(client);
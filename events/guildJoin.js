const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild, client) {
        client.settingsManager.createSettings(guild);
        console.log(`Joined guild ${guild.name} (${guild.id})`);
    }
}
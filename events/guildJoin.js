const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild, client) {
        client.settingsManager.createSettings(guild);
        client.log(`Joined guild ${guild.name} (${guild.id})`);
    }
}
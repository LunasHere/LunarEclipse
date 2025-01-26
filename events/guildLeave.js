const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildDelete,
    once: false,
    async execute(guild, client) {
        client.settingsManager.deleteSettings(guild);
        console.log(`Left guild ${guild.name} (${guild.id})`);
    }
}
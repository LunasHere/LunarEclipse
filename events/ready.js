const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.log(`Logged in as ${client.user.tag}!`);
        // get number of guilds
        const guilds = client.guilds.cache.size;
        // get number of users excluding bots
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) - client.users.cache.filter(user => user.bot).size;

        // define the statuses
        const statuses = [
            { name: `${guilds} servers`, type: ActivityType.Listening },
            { name: `${users} users`, type: ActivityType.Listening },
        ];
        // loop through the statuses and set the presence every 2 minutes
        let i = 0;
        setInterval(() => {
            client.user.setPresence({
                status: 'online',
                activities: [{
                    name: statuses[i].name,
                    type: statuses[i].type,
                }],
            });
            i = (i + 1) % statuses.length;
        }, 2 * 60 * 1000);
    }
}
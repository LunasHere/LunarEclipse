const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

class TicketManger {
    constructor(client) {
        this.client = client;
    }

    // createTicket function with promise
    createTicket(guild, user, description) {
        return new Promise(async (resolve, reject) => {
            // Get settings
            const settings = await this.client.settingsManager.getSettings(guild);
            // Get staff role
            const staffRole = guild.roles.cache.get(settings.staffrole);
            // Get ticket category
            const ticketCategory = guild.channels.cache.get(settings.ticketcategory);

            // ensure the staff role and ticket category exist
            if(!staffRole || !ticketCategory) {
                reject('Staff role or ticket category not found');
                return;
            }

            // Create the ticket
            await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                parent: ticketCategory,
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: staffRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: this.client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    }
                ]
            }).then(channel => {
                // Send the ticket message
                const embed = new EmbedBuilder()
                    .setTitle('Ticket')
                    .setDescription(`Thank you for creating a ticket! Please be patient while we get to you.`)
                    .addFields(
                        {
                            name: 'Description',
                            value: description,
                        })
                    .setTimestamp()
                    .setColor(0xFF0000);
                channel.send({ content: `${user} ${staffRole.toString()}`, embeds: [embed] });
                resolve(channel);
            }).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }

}

module.exports = TicketManger;
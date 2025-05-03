const { ChannelType, MessageFlags, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Sets up the bot for your server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            if(settings.hasbeensetup) {
                return interaction.reply({ content: 'This server has already been set up', ephemeral: true });
            }

            // Create channel for mod logs, set perms to exclude everyone, and set it in the settings
            interaction.guild.channels.create({
                name: 'mod-logs',
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks]
                    }
                ]
            }).then(channel => {
                interaction.client.settingsManager.updateSetting(interaction.guild, 'modlogchannel', channel.id).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
                });
            }).catch(err => {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while creating the channel', ephemeral: true });
            });

            // Create a category for the stats channels
            interaction.guild.channels.create({
                name: 'Stats',
                type: ChannelType.GuildCategory
            }).then(category => {
                // Create channel for member stats, set perms to exclude everyone, and set it in the settings
                interaction.guild.channels.create({
                    name: `All Members: ${interaction.guild.memberCount}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                }).then(channel => {
                    interaction.client.settingsManager.updateSetting(interaction.guild, 'memberstatschannel', channel.id).catch(err => {
                        console.error(err);
                        return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
                    });
                }).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred while creating the channel', ephemeral: true });
                });

                // Create channel for user stats, set perms to exclude everyone, and set it in the settings
                interaction.guild.channels.create({
                    name: `Users: ${interaction.guild.members.cache.filter(member => !member.user.bot).size}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                }).then(channel => {
                    interaction.client.settingsManager.updateSetting(interaction.guild, 'userstatschannel', channel.id).catch(err => {
                        console.error(err);
                        return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
                    });
                }).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred while creating the channel', ephemeral: true });
                });

                // Create channel for bot stats, set perms to exclude everyone, and set it in the settings
                interaction.guild.channels.create({
                    name: `Bots: ${interaction.guild.members.cache.filter(member => member.user.bot).size}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                }).then(channel => {
                    interaction.client.settingsManager.updateSetting(interaction.guild, 'botstatschannel', channel.id).catch(err => {
                        console.error(err);
                        return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
                    });
                }).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred while creating the channel', ephemeral: true });
                });

                // Create role for ticket staff
                interaction.guild.roles.create({
                    name: 'Ticket Staff'
                }).then(role => {
                    interaction.client.settingsManager.updateSetting(interaction.guild, 'staffrole', role.id).catch(err => {
                        console.error(err);
                        return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
                    });
                }).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred while creating the role', ephemeral: true });
                });

                // Create category for tickets
                interaction.guild.channels.create({
                    name: 'Tickets',
                    type: ChannelType.GuildCategory
                }).then(category => {
                    interaction.client.settingsManager.updateSetting(interaction.guild, 'ticketcategory', category.id).catch(err => {
                        console.error(err);
                        return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
                    });
                }).catch(err => {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred while creating the category', ephemeral: true });
                });

            }).catch(err => {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while creating the category', ephemeral: true });
            });
            interaction.client.settingsManager.updateSetting(interaction.guild, 'hasbeensetup', true).then(() => {
                interaction.reply({ content: 'The server has been set up', ephemeral: true });
            }).catch(err => {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
            });
        }).catch(err => console.log(err));
    }
}
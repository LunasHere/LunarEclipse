const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsettings')
        .setDescription('Sets the settings for the bot')
        .addStringOption(option => option.setName('setting').setDescription('The setting to change').setRequired(true).addChoices(
            { name: 'Modlog Channel', value: 'modlogchannel' },
            { name: 'Member Stats Channel', value: 'memberstatschannel' },
            { name: 'User Stats Channel', value: 'userstatschannel' },
            { name: 'Bot Stats Channel', value: 'botstatschannel' },
            { name: 'Ticket Category', value: 'ticketcategory' },
            { name: 'Staff Role', value: 'staffrole' },
            { name: 'Log Role Create', value: 'logRoleCreate' },
            { name: 'Log Role Delete', value: 'logRoleDelete' },
            { name: 'Log Member Ban Add', value: 'logMemberBanAdd' },
            { name: 'Log Member Ban Remove', value: 'logMemberBanRemove' },
            { name: 'Log Member Kick', value: 'logMemberKick' },
            { name: 'Log Member Role Update', value: 'logMemberRoleUpdate' }
        ))
        .addStringOption(option => option.setName('value').setDescription('The value to set the setting to').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');

        const logSettings = [
            'logRoleCreate', 'logRoleDelete', 'logMemberBanAdd',
            'logMemberBanRemove', 'logMemberKick', 'logMemberRoleUpdate'
        ];

        const validateChannel = (channelId, type) => {
            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) return 'That channel does not exist';
            if (channel.guild.id !== interaction.guild.id) return 'That channel is not in this guild';
            if (channel.type !== type) return `That channel is not a ${type === ChannelType.GuildText ? 'text' : 'voice'} channel`;
            return null;
        };

        const validateRole = (roleId) => {
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return 'That role does not exist';
            if (role.guild.id !== interaction.guild.id) return 'That role is not in this guild';
            return null;
        };

        if (logSettings.includes(setting)) {
            if (!['true', 'false'].includes(value.toLowerCase())) {
                return interaction.reply({ content: 'Value must be either `true` or `false` for log settings', flags: MessageFlags.Ephemeral });
            }
            await interaction.client.settingsManager.updateSetting(interaction.guild, setting, value.toLowerCase() === 'true').catch(err => {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while updating the setting', flags: MessageFlags.Ephemeral });
            });
            return interaction.reply({ content: `Setting \`${setting}\` has been set to \`${value}\``, flags: MessageFlags.Ephemeral });
        }

        let error = null;
        switch (setting) {
            case 'modlogchannel':
                error = validateChannel(value, ChannelType.GuildText);
                break;
            case 'memberstatschannel':
            case 'userstatschannel':
            case 'botstatschannel':
                error = validateChannel(value, ChannelType.GuildVoice);
                if (!error) {
                    const channel = interaction.guild.channels.cache.get(value);
                    if (setting === 'memberstatschannel') {
                        channel.setName(`All Members: ${interaction.guild.memberCount}`);
                    } else if (setting === 'userstatschannel') {
                        channel.setName(`Users: ${interaction.guild.members.cache.filter(member => !member.user.bot).size}`);
                    } else if (setting === 'botstatschannel') {
                        channel.setName(`Bots: ${interaction.guild.members.cache.filter(member => member.user.bot).size}`);
                    }
                }
                break;
            case 'ticketcategory':
                error = validateChannel(value, ChannelType.GuildCategory);
                break;
            case 'staffrole':
                error = validateRole(value);
                break;
        }

        if (error) {
            return interaction.reply({ content: error, flags: MessageFlags.Ephemeral });
        }

        await interaction.client.settingsManager.updateSetting(interaction.guild, setting, value).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while updating the setting', flags: MessageFlags.Ephemeral });
        });
        interaction.reply({ content: `Setting \`${setting}\` has been set to \`${value}\``, flags: MessageFlags.Ephemeral });
    }
}
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

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
            { name: 'Staff Role', value: 'staffrole' }
        ))
        .addStringOption(option => option.setName('value').setDescription('The value to set the setting to').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');

        switch(setting) {
            case 'modlogchannel':
                if (!interaction.guild.channels.cache.get(value)) {
                    return interaction.reply({ content: 'That channel does not exist', ephemeral: true });
                }
                // check that the channel is in this guild
                if (interaction.guild.channels.cache.get(value).guild.id !== interaction.guild.id) {
                    return interaction.reply({ content: 'That channel is not in this guild', ephemeral: true });
                }
                // check that the channel is a text channel
                if (interaction.guild.channels.cache.get(value).type !== ChannelType.GuildText) {
                    return interaction.reply({ content: 'That channel is not a text channel', ephemeral: true });
                }
                break;
            case 'memberstatschannel':
            case 'userstatschannel':
            case 'botstatschannel':
                if (!interaction.guild.channels.cache.get(value)) {
                    return interaction.reply({ content: 'That channel does not exist', ephemeral: true });
                }
                // check that the channel is in this guild
                if (interaction.guild.channels.cache.get(value).guild.id !== interaction.guild.id) {
                    return interaction.reply({ content: 'That channel is not in this guild', ephemeral: true });
                }
                // check that the channel is a voice channel
                if (interaction.guild.channels.cache.get(value).type !== ChannelType.GuildVoice) {
                    return interaction.reply({ content: 'That channel is not a voice channel', ephemeral: true });
                }
                if(setting === 'memberstatschannel') {
                    interaction.guild.channels.cache.get(value).setName(`All Members: ${interaction.guild.memberCount}`);
                }
                else if(setting === 'userstatschannel') {
                    interaction.guild.channels.cache.get(value).setName(`Users: ${interaction.guild.members.cache.filter(member => !member.user.bot).size}`);
                }
                else if(setting === 'botstatschannel') {
                    interaction.guild.channels.cache.get(value).setName(`Bots: ${interaction.guild.members.cache.filter(member => member.user.bot).size}`);
                }
                break;
            case 'ticketcategory':
                // check that the category exists
                if (!interaction.guild.channels.cache.get(value)) {
                    return interaction.reply({ content: 'That category does not exist', ephemeral: true });
                }
                // check that the category is in this guild
                if (interaction.guild.channels.cache.get(value).guild.id !== interaction.guild.id) {
                    return interaction.reply({ content: 'That category is not in this guild', ephemeral: true });
                }
                // check that the category is a category
                if (interaction.guild.channels.cache.get(value).type !== ChannelType.GuildCategory) {
                    return interaction.reply({ content: 'That channel is not a category', ephemeral: true });
                }
                break;
            case 'staffrole':
                // check that the role exists
                if (!interaction.guild.roles.cache.get(value)) {
                    return interaction.reply({ content: 'That role does not exist', ephemeral: true });
                }
                // check that the role is in this guild
                if (interaction.guild.roles.cache.get(value).guild.id !== interaction.guild.id) {
                    return interaction.reply({ content: 'That role is not in this guild', ephemeral: true });
                }
                break;
        }

        await interaction.client.settingsManager.updateSetting(interaction.guild, setting, value).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
        });
        interaction.reply({ content: `Setting \`${setting}\` has been set to \`${value}\``, ephemeral: true });
    }
}
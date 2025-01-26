const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsettings')
        .setDescription('Sets the settings for the bot')
        .addStringOption(option => option.setName('setting').setDescription('The setting to change').setRequired(true).addChoices(
            { name: 'Modlog Channel', value: 'modlogchannel' },
            { name: 'Member Stats Channel', value: 'memberstatschannel' },
            { name: 'User Stats Channel', value: 'userstatschannel' },
            { name: 'Bot Stats Channel', value: 'botstatschannel' },
        ))
        .addStringOption(option => option.setName('value').setDescription('The value to set the setting to').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');
        if (setting === 'modlogchannel' || setting === 'memberstatschannel' || setting === 'userstatschannel' || setting === 'botstatschannel') {
            if (!interaction.guild.channels.cache.get(value)) {
                return interaction.reply({ content: 'That channel does not exist', ephemeral: true });
            }
            if(setting === 'memberstatschannel' || setting === 'userstatschannel' || setting === 'botstatschannel') {
                const channel = interaction.guild.channels.cache.get(value);
                if(channel) {
                    switch(setting) {
                        case 'memberstatschannel':
                            channel.setName(`All Members: ${interaction.guild.memberCount}`);
                            break;
                        case 'userstatschannel':
                            channel.setName(`Users: ${interaction.guild.members.cache.filter(member => !member.user.bot).size}`);
                            break;
                        case 'botstatschannel':
                            channel.setName(`Bots: ${interaction.guild.members.cache.filter(member => member.user.bot).size}`);
                            break;
                    }
                }
            }
        }
        await interaction.client.settingsManager.updateSetting(interaction.guild, setting, value).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
        });
        interaction.reply({ content: `Setting \`${setting}\` has been set to \`${value}\``, ephemeral: true });
    }
}
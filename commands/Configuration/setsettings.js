const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsettings')
        .setDescription('Sets the settings for the bot')
        .addStringOption(option => option.setName('setting').setDescription('The setting to change').setRequired(true).addChoices(
            { name: 'Modlog Channel', value: 'modlogchannel' },
        ))
        .addStringOption(option => option.setName('value').setDescription('The value to set the setting to').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');
        await interaction.client.settingsManager.updateSetting(interaction.guild, setting, value).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while updating the setting', ephemeral: true });
        });
        interaction.reply({ content: `Setting \`${setting}\` has been set to \`${value}\``, ephemeral: true });
    }
}
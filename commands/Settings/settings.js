const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Shows the settings for the guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.client.config.botname} Configuration`, iconURL: `${interaction.client.config.boticon}` })
                .setDescription(`**Modlog Channel:** ${settings.modlogchannel ? `<#${settings.modlogchannel}>` : 'Not set'}\n**Member Stats Channel:** ${settings.memberstatschannel ? `<#${settings.memberstatschannel}>` : 'Not set'}\n**User Stats Channel:** ${settings.userstatschannel ? `<#${settings.userstatschannel}>` : 'Not set'}\n**Bot Stats Channel:** ${settings.botstatschannel ? `<#${settings.botstatschannel}>` : 'Not set'}`)
                .setColor(0xFF0000)
                .setTimestamp();
            interaction.reply({ embeds: [embed] });
        }).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while getting the settings', ephemeral: true });
        });
    }
}
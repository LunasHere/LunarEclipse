const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetsettings')
        .setDescription('Resets the settings for the guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.client.settingsManager.deleteSettings(interaction.guild).then(() => {
            interaction.client.settingsManager.createSettings(interaction.guild).catch(err => {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while resetting the settings', flags: MessageFlags.Ephemeral });
            });
        }).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while resetting the settings', flags: MessageFlags.Ephemeral });
        });

        interaction.reply({ content: 'Settings have been reset', flags: MessageFlags.Ephemeral });
    }
}
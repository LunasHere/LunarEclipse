const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Shows the settings for the guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.client.config.botname} Settings`, iconURL: `${interaction.client.config.boticon}` })
                .setColor(0xFF0000)
                .addFields([
                    { name: 'Modlog Channel', value: settings.modlogchannel ? `<#${settings.modlogchannel}>` : 'Not set', inline: false },
                    { name: 'Member Stats Channel', value: settings.memberstatschannel ? `<#${settings.memberstatschannel}>` : 'Not set', inline: false },
                    { name: 'User Stats Channel', value: settings.userstatschannel ? `<#${settings.userstatschannel}>` : 'Not set', inline: false },
                    { name: 'Bot Stats Channel', value: settings.botstatschannel ? `<#${settings.botstatschannel}>` : 'Not set', inline: false },
                    { name: 'Ticket Category', value: settings.ticketcategory ? `${interaction.guild.channels.cache.get(settings.ticketcategory).name}` : 'Not set', inline: false },
                    { name: 'Staff Role', value: settings.staffrole ? `<@&${settings.staffrole}>` : 'Not set', inline: false }
                ]);
            interaction.reply({ embeds: [embed] });
        }).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while getting the settings', flags: MessageFlags.Ephemeral });
        });
    }
}
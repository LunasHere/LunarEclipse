const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getwarn')
        .setDescription('Gets a warn via Case ID')
        .addStringOption(option => option.setName('caseid').setDescription('The case ID of the warn').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const caseid = interaction.options.getString('caseid');
        const warn = await interaction.client.warnManager.getWarn(interaction.guild.id, caseid);
        if (!warn || warn === null) {
            const nowarn = new EmbedBuilder()
                .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                .setDescription(`No warn found with Case ID ${caseid}.`)
                .setColor(0xFF0000)
                .setTimestamp();
            return interaction.reply({ embeds: [nowarn] });
        }
        // get the user
        const user = await interaction.client.users.fetch(warn.user).catch(() => {
            user = warn.userid + ' (Could not fetch user)';
        });
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .setDescription(`**Case ID:** ${warn.caseid}\n**User:** ${user}\n**Reason:** ${warn.reason}\n**Moderator:** ${warn.warnedby}\n**Date:** ${warn.date}`)
            .setColor(0xFF0000)
            .setTimestamp();
        interaction.reply({ embeds: [embed] });
    }
}
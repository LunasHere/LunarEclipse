const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user')
        .addUserOption(option => option.setName('user').setDescription('The user to unban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the unban').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const bans = await interaction.guild.bans.fetch();
        const ban = bans.find(ban => ban.user.id === user.id);
        if (!ban) return interaction.reply({ content: 'User is not banned', ephemeral: true });
        await interaction.guild.bans.remove(user, { reason: reason });
        const channel = interaction.client.settingsManager.getGuildSettings(interaction.guild).modlogchannel;
        if (channel) {
            const modembed = new EmbedBuilder()
                .setDescription(`**${user.username}#${user.discriminator}** has been unbanned by **${interaction.user}** for **${reason}**`)
                .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                .setColor(0xFF0000)
                .setTimestamp();
            channel.send({ embeds: [modembed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`**${user}** has been unbanned.`)
            .addFields({ name: 'Reason', value: reason, inline: true })
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .setColor(0xFF0000)
            .setTimestamp();
        interaction.channel.send({ embeds: [embed] });

        interaction.reply({ content: `**${user}** has been unbanned`, ephemeral: true });
    }
}
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

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
        if (!ban) return interaction.reply({ content: 'User is not banned', flags: MessageFlags.Ephemeral });
        await interaction.guild.bans.remove(user, { reason: reason });
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            if(settings.modlogchannel) {
                const channel = interaction.guild.channels.cache.get(settings.modlogchannel);
                const modembed = new EmbedBuilder()
                    .setDescription(`**${user.username}#${user.discriminator}** (User ID: ${user.id}) has been unbanned.`)
                    .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                    .addFields({ name: 'Issued By', value: `${interaction.user}`, inline: true}, { name: 'Reason', value: reason, inline: true })
                    .setColor(0xFF0000)
                    .setTimestamp();
                channel.send({ embeds: [modembed] });
            }
        }).catch(err => console.log(err));

        interaction.reply({ content: `**${user}** has been unbanned`, flags: MessageFlags.Ephemeral });
    }
}
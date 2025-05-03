const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user')
        .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        // Check if the user is trying to ban themselves
        if (user.id === interaction.user.id) return interaction.reply({ content: 'You cannot ban yourself', flags: MessageFlags.Ephemeral });
        // Check if the user is trying to ban a bot
        if (user.bot) return interaction.reply({ content: 'You cannot ban a bot', flags: MessageFlags.Ephemeral });
        const reason = interaction.options.getString('reason');

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            if (member.roles.highest.position >= interaction.member.roles.highest.position 
                && interaction.guild.ownerId !== interaction.user.id) {
                return interaction.reply({ content: 'You cannot ban a user with the same or higher role than yourself', flags: MessageFlags.Ephemeral });
            }
        }
        
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            if(settings.modlogchannel) {
                const channel = interaction.guild.channels.cache.get(settings.modlogchannel);
                const modembed = new EmbedBuilder()
                    .setDescription(`${user} (ID: ${user.id}) has been banned.`)
                    .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                    .addFields({ name: 'Issued By', value: `${interaction.user}`, inline: true}, { name: 'Reason', value: reason, inline: true })
                    .setColor(0xFF0000)
                    .setTimestamp();
                channel.send({ embeds: [modembed] });
            }
        }).catch(err => interaction.client.log(err));

        const userembed = new EmbedBuilder()
            .setDescription(`You have been banned from **${interaction.guild.name}**.  If you feel this ban was unjust, please contact the server owner.`)
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .addFields({ name: 'Reason', value: reason, inline: true })
            .setColor(0xFF0000)
            .setTimestamp();
        user.send({ embeds: [userembed] }).catch(err => interaction.client.log(err));

        interaction.guild.members.ban(user, { reason: reason }).then(() => {
            const embed = new EmbedBuilder()
                .setDescription(`**${user}** has been banned.`)
                .addFields({ name: 'Reason', value: reason, inline: true })
                .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                .setColor(0xFF0000)
                .setTimestamp();
            interaction.reply({ embeds: [embed] });
        }).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while banning the user', flags: MessageFlags.Ephemeral });
        });
    }
}
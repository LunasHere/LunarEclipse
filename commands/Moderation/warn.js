const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
        .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        // Check if the user is trying to warn themselves
        if (user.id === interaction.user.id) return interaction.reply({ content: 'You cannot warn yourself', flags: MessageFlags.Ephemeral });
        // Check if the user is trying to warn a bot
        if (user.bot) return interaction.reply({ content: 'You cannot warn a bot', flags: MessageFlags.Ephemeral });
        const reason = interaction.options.getString('reason');
        const warns = await interaction.client.warnManager.getNumOfWarns(interaction.guild.id, user);
        let caseid;
        await interaction.client.warnManager.addWarn(interaction.guild.id, user, interaction.user, reason).then(id =>{
            caseid = id;
        }).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while adding the warn', flags: MessageFlags.Ephemeral });
        });
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            if(settings.modlogchannel) {
                const channel = interaction.guild.channels.cache.get(settings.modlogchannel);
                const modembed = new EmbedBuilder()
                    .setDescription(`**${user.username}#${user.discriminator}** (User ID: ${user.id}) has been warned.`)
                    .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                    .addFields({ name: 'Issued By', value: `${interaction.user}`, inline: true}, { name: 'Reason', value: reason, inline: true }, { name: 'Warnings', value: `${warns + 1}`, inline: true }, { name: 'Case ID', value: `${caseid}`, inline: true })
                    .setColor(0xFF0000)
                    .setTimestamp();
                channel.send({ embeds: [modembed] });
            }
        }).catch(err => console.error(err));

        const userembed = new EmbedBuilder()
            .setDescription(`You have been warned in **${interaction.guild.name}**.  Please be sure to read the rules and follow them.  If you continue to break the rules, you will be kicked or banned.`)
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .addFields({ name: 'Reason', value: reason, inline: true }, { name: 'Warnings', value: `${warns + 1}`, inline: true }, { name: 'Case ID', value: `${caseid}`, inline: true })
            .setColor(0xFF0000)
            .setTimestamp();
        user.send({ embeds: [userembed] }).catch(err => console.error(err));

        const embed = new EmbedBuilder()
            .setDescription(`**${user}** has been warned.`)
            .addFields({ name: 'Reason', value: reason, inline: true })
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .setColor(0xFF0000)
            .setTimestamp();
        interaction.channel.send({ embeds: [embed] });

        interaction.reply({ content: `**${user}** has been warned`, flags: MessageFlags.Ephemeral });
    }
}
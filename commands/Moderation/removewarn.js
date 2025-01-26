const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removewarn')
        .setDescription('Removes a warn via Case ID')
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
            return interaction.reply({ embeds: [nowarn], ephemeral: true });
        }
        await interaction.client.warnManager.removeWarn(interaction.guild.id, caseid);
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .setDescription(`Warn with Case ID ${caseid} has been removed.`)
            .setColor(0xFF0000)
            .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });

        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            if(settings.modlogchannel) {
                const channel = interaction.guild.channels.cache.get(settings.modlogchannel);
                const modembed = new EmbedBuilder()
                    .setDescription(`**<@${warn.user}>**'s warn with Case ID ${caseid} has been removed by **${interaction.user}**.`)
                    .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
                    .setColor(0xFF0000)
                    .setTimestamp();
                channel.send({ embeds: [modembed] });
            }
        }).catch(err => console.log(err));

    }
}
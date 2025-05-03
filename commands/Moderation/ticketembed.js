const { EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketembed')
        .setDescription('Creates a ticket embed')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.config.botname} Moderation`, iconURL: `${interaction.client.config.boticon}` })
            .setDescription('Please click the button below to create a ticket!')
            .setColor(0xFF0000);
        const row = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setLabel('Create a ticket')
                    .setStyle(1)
                    .setEmoji('🎫')
                    .setCustomId('lunarCreateTicket'),
            ]);
        interaction.channel.send({ embeds: [embed], components: [row] });
        interaction.reply({ content: 'Ticket embed sent!', flags: MessageFlags.Ephemeral });
    }
}
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss someone!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kiss')
                .setRequired(true)),
    async execute(interaction) {
        // Get the user to kiss
        const user = interaction.options.getUser('user');

        // Get the image
        const res = await fetch('https://api.waifu.pics/sfw/kiss');
        const kiss = await res.json();
        
        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.client.config.botname} Fun`)
            .setDescription(`${interaction.user} kissed ${user}!`)
            .setColor(0xFF0000)
            .setImage(kiss.url)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
};
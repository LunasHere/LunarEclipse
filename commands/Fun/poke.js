const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poke')
        .setDescription('Poke someone!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to poke')
                .setRequired(true)),
    async execute(interaction) {
        // Get the user to poke
        const user = interaction.options.getUser('user');

        // Get the image
        const res = await fetch('https://api.waifu.pics/sfw/poke');
        const poke = await res.json();
        
        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.client.config.botname} Fun`)
            .setDescription(`${interaction.user} poked ${user}!`)
            .setColor(0xFF0000)
            .setImage(poke.url)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
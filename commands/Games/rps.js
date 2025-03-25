const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock, Paper, Scissors')
        .addStringOption(option => option.setName('choice').setDescription('Your choice').setRequired(true).addChoices(
            { name: 'Rock', value: 'rock' },
            { name: 'Paper', value: 'paper' },
            { name: 'Scissors', value: 'scissors' }
        )),
    async execute(interaction) {
        const choice = interaction.options.getString('choice');
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let result;
        if (choice === botChoice) {
            result = 'It\'s a tie!';
        }
        else if ((choice === 'rock' && botChoice === 'scissors') ||
            (choice === 'paper' && botChoice === 'rock') ||
            (choice === 'scissors' && botChoice === 'paper')) {
            result = 'You win!';
        }
        else {
            result = 'You lose!';
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.client.config.botname} Games`, iconURL: `${interaction.client.config.boticon}` })
            .setDescription(`You chose ${choice}. I chose ${botChoice}. ${result}`)
            .setColor(0xFF0000)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
}
const { Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (interaction.isCommand()) {
            await handleCommand(interaction);
            return;
        }

        if (interaction.isButton()) {
            await handleButton(interaction);
            return;
        }

        if (interaction.isModalSubmit()) {
            await handleModal(interaction);
            return;
        }
    }
};

async function handleCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

async function handleButton(interaction) {
    if (interaction.customId === 'lunarCreateTicket') {
        const settings = await interaction.client.settingsManager.getSettings(interaction.guild);
        if (!settings.ticketcategory || !settings.staffrole) {
            return interaction.reply({ content: 'The staff of this server have not set up the ticket system.', ephemeral: true });
        }

        const cooldown = await interaction.client.cooldownManager.getCooldown('ticket', interaction.user);
        if (cooldown > Date.now()) {
            return interaction.reply({ content: 'Please do not spam tickets!', ephemeral: true });
        }

        interaction.client.cooldownManager.addCooldown('ticket', interaction.user, 5 * 60 * 1000);

        const modal = new ModalBuilder()
            .setTitle('Ticket')
            .setCustomId('ticketDescription')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('description')
                        .setLabel('Please describe your issue')
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await interaction.showModal(modal);
    }
}

async function handleModal(interaction) {
    if (interaction.customId === 'ticketDescription') {
        const description = interaction.fields.getField('description', ComponentType.TextInput);
        const ticket = await interaction.client.ticketManager.createTicket(interaction.guild, interaction.user, description.value);
        await interaction.reply({ content: `Ticket created! [Click Here](${ticket.url})`, ephemeral: true });
    }
}
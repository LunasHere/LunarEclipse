const { Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Check if the interaction is a command
        if (interaction.isCommand()) {
            // Obtain the command
            const command = interaction.client.commands.get(interaction.commandName);

            // Check if the command exists
            if (!command) return;

            try {
                // Execute the command
                await command.execute(interaction);
            } catch (error) {
                // Log the error and reply to the user
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            return;
        }
        if (interaction.isButton()) {
            // Check if the button has a custom id of bug, report, or other
            if (interaction.customId === 'lunarCreateTicket') {
                // Check if guild has a ticket category and staff role set from the settings
                const settings = await interaction.client.settingsManager.getSettings(interaction.guild);
                if (!settings.ticketcategory || !settings.staffrole) {
                    return interaction.reply({ content: 'The staff of this server have not set up the ticket system.', ephemeral: true });
                }
                
                // Create a modal
                const modal = new ModalBuilder()
                    .setTitle('Ticket')
                    .setCustomId('ticketDescription');
                

                const descriptionInput = new TextInputBuilder()
                    .setCustomId('description')
                    .setLabel("Please describe your issue")
			        .setStyle(TextInputStyle.Paragraph);

                const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);

                modal.addComponents(descriptionRow);

                const cooldown = await interaction.client.cooldownManager.getCooldown('ticket', interaction.user);
                if (cooldown > Date.now()) {
                    return interaction.reply({ content: `Please do not spam tickets!`, ephemeral: true });
                }
                interaction.client.cooldownManager.addCooldown('ticket', interaction.user, 5*60*1000);
                await interaction.showModal(modal);
            }
            return;
        }

        // Check if interaction is a modal
        if (interaction.isModalSubmit()) {
            if(interaction.customId === 'ticketDescription') {
                // Get the description from the modal
                const description = interaction.fields.getField('description', ComponentType.TextInput);
                // Create the ticket with ticketmanager
                const ticket = await interaction.client.ticketManager.createTicket(interaction.guild, interaction.user, description.value);
                interaction.reply({ content: `Ticket created! [Click Here](${ticket.url})`, ephemeral: true });
            }
            return;
        }
    }   
}   
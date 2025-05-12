const { Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType, MessageFlags, ChannelType } = require('discord.js');

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
        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    }
}

async function handleButton(interaction) {
    if (interaction.customId === 'lunarCreateTicket') {
        const settings = await interaction.client.settingsManager.getSettings(interaction.guild);
        if (!settings.ticketcategory || !settings.staffrole) {
            return interaction.reply({ content: 'The staff of this server have not set up the ticket system.', flags: MessageFlags.Ephemeral });
        }

        const cooldown = await interaction.client.cooldownManager.getCooldown('ticket', interaction.user);
        if (cooldown > Date.now()) {
            return interaction.reply({ content: 'Please do not spam tickets!', flags: MessageFlags.Ephemeral });
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
    } else if (interaction.customId.startsWith('lunarSetting_')) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to do that!', flags: MessageFlags.Ephemeral });
        }

        // list of toggleable settings
        const logSettings = [
            'logRoleCreate', 'logRoleDelete', 'logMemberBanAdd',
            'logMemberBanRemove', 'logMemberKick', 'logMemberRoleUpdate'
        ];

        const setting = interaction.customId.split('_')[1];
        if (logSettings.includes(setting)) {
            const settings = await interaction.client.settingsManager.getSettings(interaction.guild);
            let currentValue = settings[setting];
            if (currentValue === undefined) {
                currentValue = false;
            }

            const newValue = !currentValue;
            await interaction.client.settingsManager.updateSetting(interaction.guild, setting, newValue);
            await interaction.reply({ content: `Setting \`${setting}\` has been set to \`${newValue}\``, flags: MessageFlags.Ephemeral });
            return;
        }

        // if not a toggleable setting, open a modal for the setting
        const settingmodal = new ModalBuilder()
            .setTitle('Setting')
            .setCustomId(`lunarSetting_${setting}`)
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('value')
                        .setLabel(`Please enter a value for ${setting}`)
                        .setStyle(TextInputStyle.Short)
                )
            );
        await interaction.showModal(settingmodal);
    } else if (interaction.customId.startsWith('lunarRoleMenu_')) {
        const roleId = interaction.customId.split('_')[1];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({ content: 'That role does not exist', flags: MessageFlags.Ephemeral });
        }

        if (interaction.member.roles.cache.has(roleId)) {
            await interaction.member.roles.remove(roleId).then(() => {
                interaction.reply({ content: `Removed role <@&${roleId}>`, flags: MessageFlags.Ephemeral });
            }).catch(err => {
                console.error(err);
                interaction.reply({ content: 'An error occurred while removing the role', flags: MessageFlags.Ephemeral });
            });
        } else {
            await interaction.member.roles.add(roleId).then(() => {
                interaction.reply({ content: `Added role <@&${roleId}>`, flags: MessageFlags.Ephemeral });
            }).catch(err => {
                console.error(err);
                interaction.reply({ content: 'An error occurred while adding the role', flags: MessageFlags.Ephemeral });
            });
        }
    }

}

async function handleModal(interaction) {
    if (interaction.customId === 'ticketDescription') {
        const description = interaction.fields.getField('description', ComponentType.TextInput);
        const ticket = await interaction.client.ticketManager.createTicket(interaction.guild, interaction.user, description.value);
        await interaction.reply({ content: `Ticket created! [Click Here](${ticket.url})`, flags: MessageFlags.Ephemeral });
    } else if (interaction.customId.startsWith('lunarSetting_')) {
        const setting = interaction.customId.split('_')[1];
        const value = interaction.fields.getField('value', ComponentType.TextInput).value;
        let error = null;

        const validateChannel = (channelId, type) => {
            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) return 'That channel does not exist';
            if (channel.guild.id !== interaction.guild.id) return 'That channel is not in this guild';
            if (channel.type !== type) return `That channel is not a ${type === ChannelType.GuildText ? 'text' : 'voice'} channel`;
            return null;
        };
        
        const validateRole = (roleId) => {
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return 'That role does not exist';
            if (role.guild.id !== interaction.guild.id) return 'That role is not in this guild';
            return null;
        };

        switch (setting) {
            case 'modlogchannel':
                error = validateChannel(value, ChannelType.GuildText);
                break;
            case 'memberstatschannel':
            case 'userstatschannel':
            case 'botstatschannel':
                error = validateChannel(value, ChannelType.GuildVoice);
                if (!error) {
                    const channel = interaction.guild.channels.cache.get(value);
                    if (setting === 'memberstatschannel') {
                        channel.setName(`All Members: ${interaction.guild.memberCount}`);
                    } else if (setting === 'userstatschannel') {
                        channel.setName(`Users: ${interaction.guild.members.cache.filter(member => !member.user.bot).size}`);
                    } else if (setting === 'botstatschannel') {
                        channel.setName(`Bots: ${interaction.guild.members.cache.filter(member => member.user.bot).size}`);
                    }
                }
                break;
            case 'ticketcategory':
                error = validateChannel(value, ChannelType.GuildCategory);
                break;
            case 'staffrole':
                error = validateRole(value);
                break;
        }

        if (error) {
            return interaction.reply({ content: error, flags: MessageFlags.Ephemeral });
        }

        await interaction.client.settingsManager.updateSetting(interaction.guild, setting, value).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while updating the setting', flags: MessageFlags.Ephemeral });
        });
        interaction.reply({ content: `Setting \`${setting}\` has been set to \`${value}\``, flags: MessageFlags.Ephemeral });
    }
}
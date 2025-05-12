const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const createRoleButton = (role) => {
    return new ButtonBuilder()
        .setLabel(role.name)
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`lunarRoleMenu_${role.id}`);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolemenu')
        .setDescription('Creates a role menu')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the role menu')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The description of the role menu')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role1')
                .setDescription('The first role to add to the menu')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role2')
                .setDescription('The second role to add to the menu')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role3')
                .setDescription('The third role to add to the menu')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role4')
                .setDescription('The fourth role to add to the menu')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role5')
                .setDescription('The fifth role to add to the menu')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        try {
            const { options } = interaction;
            const title = options.getString('title');
            const description = options.getString('description');
            
            const roles = [1, 2, 3, 4, 5]
                .map(i => options.getRole(`role${i}`))
                .filter(Boolean);

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(0xFF0000);

            const row = new ActionRowBuilder()
                .addComponents(roles.map(createRoleButton));

            await interaction.reply({ embeds: [embed], components: [row] });
            await interaction.followUp({ content: 'Role menu sent!', flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Role menu error:', error);
            await interaction.reply({ content: 'There was an error creating the role menu.', flags: MessageFlags.Ephemeral });
        }
    }
};

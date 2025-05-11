const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Shows the settings for the guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.client.settingsManager.getSettings(interaction.guild).then(settings => {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.client.config.botname} Settings`, iconURL: `${interaction.client.config.boticon}` })
                .setColor(0xFF0000)
                .addFields([
                    { name: 'Modlog Channel', value: settings.modlogchannel ? `<#${settings.modlogchannel}>` : 'Not set', inline: true },
                    { name: 'Member Stats Channel', value: settings.memberstatschannel ? `<#${settings.memberstatschannel}>` : 'Not set', inline: true },
                    { name: 'User Stats Channel', value: settings.userstatschannel ? `<#${settings.userstatschannel}>` : 'Not set', inline: true },
                    { name: 'Bot Stats Channel', value: settings.botstatschannel ? `<#${settings.botstatschannel}>` : 'Not set', inline: true },
                    { name: 'Ticket Category', value: settings.ticketcategory ? `${interaction.guild.channels.cache.get(settings.ticketcategory).name}` : 'Not set', inline: true },
                    { name: 'Staff Role', value: settings.staffrole ? `<@&${settings.staffrole}>` : 'Not set', inline: true },
                    { name: 'Log Role Create', value: settings.logRoleCreate ? 'Enabled' : 'Disabled', inline: true },
                    { name: 'Log Role Delete', value: settings.logRoleDelete ? 'Enabled' : 'Disabled', inline: true },
                    { name: 'Log Member Ban Add', value: settings.logMemberBanAdd ? 'Enabled' : 'Disabled', inline: true },
                    { name: 'Log Member Ban Remove', value: settings.logMemberBanRemove ? 'Enabled' : 'Disabled', inline: true },
                    { name: 'Log Member Kick', value: settings.logMemberKick ? 'Enabled' : 'Disabled', inline: true },
                    { name: 'Log Member Role Update', value: settings.logMemberRoleUpdate ? 'Enabled' : 'Disabled', inline: true }
                ]);
            const row = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel('Set Modlog Channel')
                        .setStyle(1)
                        .setEmoji('📜')
                        .setCustomId('lunarSetting_modlogchannel'),
                    new ButtonBuilder()
                        .setLabel('Set Member Stats Channel')
                        .setStyle(1)
                        .setEmoji('📊')
                        .setCustomId('lunarSetting_memberstatschannel'),
                    new ButtonBuilder()
                        .setLabel('Set User Stats Channel')
                        .setStyle(1)
                        .setEmoji('📊')
                        .setCustomId('lunarSetting_userstatschannel'),
                    new ButtonBuilder()
                        .setLabel('Set Bot Stats Channel')
                        .setStyle(1)
                        .setEmoji('🤖')
                        .setCustomId('lunarSetting_botstatschannel'),
                    new ButtonBuilder()
                        .setLabel('Set Ticket Category')
                        .setStyle(1)
                        .setEmoji('🎫')
                        .setCustomId('lunarSetting_ticketcategory'),
                ]);
            const row2 = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel('Set Staff Role')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_staffrole'),
                    new ButtonBuilder()
                        .setLabel('Toggle Logging: Role Create')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_logRoleCreate'),
                    new ButtonBuilder()
                        .setLabel('Toggle Logging: Role Delete')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_logRoleDelete'),
                    new ButtonBuilder()
                        .setLabel('Toggle Logging: Member Ban Add')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_logMemberBanAdd'),
                    new ButtonBuilder()
                        .setLabel('Toggle Logging: Member Ban Remove')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_logMemberBanRemove'),
                ]);
            const row3 = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setLabel('Toggle Logging: Member Kick')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_logMemberKick'),
                    new ButtonBuilder()
                        .setLabel('Toggle Logging: Member Role Update')
                        .setStyle(1)
                        .setEmoji('👮')
                        .setCustomId('lunarSetting_logMemberRoleUpdate'),
                ]);

            interaction.reply({ embeds: [embed], components: [row, row2, row3] });
            
        }).catch(err => {
            console.error(err);
            return interaction.reply({ content: 'An error occurred while getting the settings', flags: MessageFlags.Ephemeral });
        });
    }
}
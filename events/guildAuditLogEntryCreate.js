const { AuditLogEvent, Events, EmbedBuilder } = require("discord.js");

module.exports = {
    name: Events.GuildAuditLogEntryCreate,
    once: false,
    async execute(auditLog, guild, client) {
        const actionHandlers = {
            [AuditLogEvent.RoleCreate]: async () => {
                const target = auditLog.target;
                const executor = auditLog.executor;
                return {
                    settingKey: 'logRoleCreate', // Specific setting for RoleCreate
                    description: `<@&${target.id}> (ID: ${target.id}) has been created.`,
                    fields: [
                        { name: 'Created By', value: `${executor}`, inline: false }
                    ],
                    color: 0x00FF00
                };
            },
            [AuditLogEvent.RoleDelete]: async () => {
                const target = auditLog.target;
                const executor = auditLog.executor;
                return {
                    settingKey: 'logRoleDelete', // Specific setting for RoleDelete
                    description: `<@&${target.id}> (ID: ${target.id}) has been deleted.`,
                    fields: [
                        { name: 'Deleted By', value: `${executor}`, inline: false }
                    ],
                    color: 0xFF0000
                };
            },
            [AuditLogEvent.MemberBanAdd]: async () => {
                const target = auditLog.target;
                const executor = auditLog.executor;
                const reason = auditLog.reason || "No reason provided";
                return {
                    settingKey: 'logMemberBanAdd', // Specific setting for MemberBanAdd
                    description: `${target} (ID: ${target.id}) has been banned.`,
                    fields: [
                        { name: 'Issued By', value: `${executor}`, inline: false },
                        { name: 'Reason', value: reason, inline: false }
                    ],
                    color: 0xFF0000
                };
            },
            [AuditLogEvent.MemberBanRemove]: async () => {
                const target = auditLog.target;
                const executor = auditLog.executor;
                return {
                    settingKey: 'logMemberBanRemove', // Specific setting for MemberBanRemove
                    description: `${target} (ID: ${target.id}) has been unbanned.`,
                    fields: [
                        { name: 'Unbanned By', value: `${executor}`, inline: false }
                    ],
                    color: 0x00FF00
                };
            },
            [AuditLogEvent.MemberKick]: async () => {
                const target = auditLog.target;
                const executor = auditLog.executor;
                const reason = auditLog.reason || "No reason provided";
                return {
                    settingKey: 'logMemberKick', // Specific setting for MemberKick
                    description: `${target} (ID: ${target.id}) has been kicked.`,
                    fields: [
                        { name: 'Issued By', value: `${executor}`, inline: false },
                        { name: 'Reason', value: reason, inline: false }
                    ],
                    color: 0xFF0000
                };
            },
            [AuditLogEvent.MemberRoleUpdate]: async () => {
                const target = auditLog.target;
                const executor = auditLog.executor;
                const addedRoles = auditLog.changes.find(change => change.key === '$add')?.new.map(role => `<@&${role.id}>`).join(', ') || 'None';
                const removedRoles = auditLog.changes.find(change => change.key === '$remove')?.new.map(role => `<@&${role.id}>`).join(', ') || 'None';
                return {
                    settingKey: 'logMemberRoleUpdate', // Specific setting for MemberRoleUpdate
                    description: `${target} (ID: ${target.id}) has had their roles updated.`,
                    fields: [
                        { name: 'Updated By', value: `${executor}`, inline: false },
                        { name: 'Roles Added', value: addedRoles, inline: true },
                        { name: 'Roles Removed', value: removedRoles, inline: true }
                    ],
                    color: 0xFF0000
                };
            }
        };

        if (auditLog.executor.id === client.user.id) return;

        const settings = await client.settingsManager.getSettings(guild);

        const handler = actionHandlers[auditLog.action];
        if (handler) {
            const embedData = await handler();
            if (!settings[embedData.settingKey]) return; // Check specific setting for the action

            const modlogChannel = guild.channels.cache.get(settings.modlogchannel);
            if (modlogChannel) {
                const embed = new EmbedBuilder()
                    .setDescription(embedData.description)
                    .setAuthor({ name: `${client.config.botname} Moderation`, iconURL: `${client.config.boticon}` })
                    .addFields(...embedData.fields)
                    .setColor(embedData.color)
                    .setTimestamp();
                modlogChannel.send({ embeds: [embed] }).catch(err => console.error(err));
            }
        }
    }
}
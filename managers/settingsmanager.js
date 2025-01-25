const { resolveColor } = require("discord.js");

class SettingsManager {
    constructor(client) {
        this.client = client;
        this.client.db.query(`CREATE TABLE IF NOT EXISTS settings (guild TEXT, settings TEXT)`);
    }

    async createSettings(guild) {
        return new Promise((resolve, reject) => {
            this.client.db.query(`INSERT INTO settings (guild, settings) VALUES ('${guild.id}', '{}')`, (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    async getSettings(guild) {
        return new Promise((resolve, reject) => {
            this.client.db.query(`SELECT * FROM settings WHERE guild = '${guild.id}'`, (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(result[0] ? JSON.parse(result[0].settings) : {});
            });
        });
    }

    async updateSetting(guild, setting, value) {
        return new Promise((resolve, reject) => {
            this.client.db.query(`SELECT * FROM settings WHERE guild = '${guild.id}'`, (err, result) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                const settings = result[0] ? JSON.parse(result[0].settings) : {};
                settings[setting] = value;
                this.client.db.query(`UPDATE settings SET settings = '${JSON.stringify(settings)}' WHERE guild = '${guild.id}'`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }

}
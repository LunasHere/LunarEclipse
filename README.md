# LunarEclipse

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.9.0-brightgreen.svg)](https://nodejs.org/en/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/lunashere/LunarEclipse/graphs/commit-activity)

A feature-rich Discord bot built with Discord.js, designed for enhancing server functionality and user engagement.

## 🚀 Features

### Current Features
- **Fun Commands** - Keep your server entertaining with various fun commands
- **Games** - Interactive games for server members
- **Moderation** - Tools to help maintain server order

### 🔜 Upcoming Features
- **Utility** - Quality of life improvements for server management
- **Music** - High-quality music playback system

## 📋 Requirements
- Node.js 16.9.0 or newer
- Discord.js v14
- MySQL Database

## 🛠️ Setup & Installation

1. Clone the repository and navigate to directory
```bash
git clone https://github.com/lunashere/LunarEclipse.git
cd LunarEclipse
```

2. Install required dependencies
```bash
npm install
```

3. Set up configuration
```bash
cp config.example.json config.json
```

4. Configure the bot
Edit `config.json` and update the following required fields:
```json
{
    "token": "your-bot-token",
    "prefix": "!",
    "database": {
        "host": "localhost",
        "user": "username",
        "password": "password",
        "database": "lunareclipse"
    }
}
```

5. Start the bot
```bash
npm start
```

> **Note**: Make sure you have MySQL installed and running before starting the bot.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
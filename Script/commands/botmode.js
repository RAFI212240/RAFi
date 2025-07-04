const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "botmode",
    version: "1.0.1", // Version updated for language change
    hasPermssion: 2, // Only Bot Admin (you) can use this
    credits: "Perplexity AI",
    description: "Toggles bot's operational mode (adminOnly/public).",
    commandCategory: "system",
    usages: "[adminOnly/public]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const configPath = path.join(__dirname, '..', '..', 'global.config.json'); // Path to global.config.json

    try {
        let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const currentMode = config.BOTMODE;

        let newMode;
        if (args[0] && args[0].toLowerCase() === "adminonly") {
            newMode = "adminOnly";
        } else if (args[0] && args[0].toLowerCase() === "public") {
            newMode = "public";
        } else {
            // If no argument is provided, show the current mode
            return api.sendMessage(`
🌟 Current Bot Mode: \`${currentMode}\` 🌟
Usage: ${global.config.PREFIX}botmode [adminOnly / public]
`, threadID, messageID);
        }

        if (currentMode === newMode) {
            return api.sendMessage(`
⚠️ Bot is already in \`${newMode}\` mode!
`, threadID, messageID);
        }

        config.BOTMODE = newMode;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');

        // Stylish output in English
        const message = `
╭───────•◈•───────╮
 🌟  𝗕𝗼𝘁 𝗠𝗼𝗱𝗲 𝗨𝗽𝗱𝗮𝘁𝗲𝗱!  🌟
╰───────•◈•───────╯

✨ 𝗡𝗲𝘄 𝗠𝗼𝗱𝗲:  \`${newMode.toUpperCase()}\`
${newMode === 'adminOnly' ? '🔒 Now, only admins can use bot commands.' : '🌐 Now, everyone can use bot commands.'}
`;

        api.sendMessage(message, threadID, messageID);

    } catch (e) {
        console.error("Error setting bot mode:", e);
        api.sendMessage("Failed to change bot mode. Please check the file path and JSON syntax.", threadID, messageID);
    }
};
      

const fs = require('fs');
const axios = require('axios'); // নিশ্চিত করুন এই মডিউলটি ইনস্টল করা আছে

module.exports.config = {
    name: "wasted",
    version: "1.1.0", // সংস্করণ আপডেট করা হলো
    hasPermssion: 0,
    credits: "Perplexity AI (API by Vacefron)",
    description: "Sends a wasted style image with user's avatar.",
    commandCategory: "image",
    usages: "[reply to a message or mention user]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    let targetUID = senderID;

    if (messageReply && messageReply.senderID) {
        targetUID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
        targetUID = Object.keys(mentions)[0];
    }

    api.sendMessage("⏳ Generating wasted image, please wait...", threadID, messageID);

    try {
        const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        
        // এখানে API পরিবর্তন করা হয়েছে
        const res = await axios.get(`https://vacefron.nl/api/wasted?user=${encodeURIComponent(avatarUrl)}`, { responseType: 'arraybuffer' });

        const path = __dirname + "/cache/wasted.png";
        fs.writeFileSync(path, Buffer.from(res.data, 'utf-8'));

        api.sendMessage({
            body: "Here is your wasted image:",
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);
    } catch (error) {
        console.error("Error generating wasted image:", error);
        api.sendMessage("❌ Failed to generate wasted image. Please try again later or check the user's avatar.", threadID, messageID);
    }
};

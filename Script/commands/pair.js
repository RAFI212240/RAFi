const fs = require("fs-extra");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
    name: "pair",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Perplexity AI (Adapted from various sources)",
    description: "Generates a pairing image with another user in the group.",
    commandCategory: "love",
    usages: "",
    cooldowns: 15,
};

// Helper function to create the image
async function makePairImage({ avatar1, avatar2 }) {
    const backgroundPath = `${__dirname}/cache/pair_bg.png`;
    const fontPath = `${__dirname}/cache/pair_font.ttf`;

    // Register the custom font
    registerFont(fontPath, { family: "PairFont" });

    const avt1 = await loadImage(avatar1);
    const avt2 = await loadImage(avatar2);
    const background = await loadImage(backgroundPath);

    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    // Draw first avatar (left)
    ctx.drawImage(avt1, 100, 250, 200, 200); // Adjust coordinates (x, y, width, height) as needed
    
    // Draw second avatar (right)
    ctx.drawImage(avt2, 400, 250, 200, 200); // Adjust coordinates as needed

    const path = `${__dirname}/cache/pair.png`;
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path, buffer);
    return path;
}


module.exports.run = async function({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const { participantIDs } = threadInfo;

    // Filter out the sender and the bot
    const potentialPartners = participantIDs.filter(id => id !== senderID && id !== api.getCurrentUserID());

    if (potentialPartners.length < 1) {
        return api.sendMessage("You need more people in this group to find a pair!", threadID, messageID);
    }

    // Randomly choose a partner
    const partnerID = potentialPartners[Math.floor(Math.random() * potentialPartners.length)];
    
    const senderName = await Users.getNameUser(senderID);
    const partnerName = await Users.getNameUser(partnerID);

    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2 = `https://graph.facebook.com/${partnerID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    api.sendMessage("Finding a soulmate for you... 💖", threadID, messageID);
    
    try {
        const path = await makePairImage({ avatar1, avatar2 });
        
        const lovePercentage = (Math.random() * (100 - 80) + 80).toFixed(2); // Random percentage between 80-100%

        const msg = {
            body: `
┌─ Pair Result ─┐

✨ Hey ${senderName}!
💖 Your soulmate is: ${partnerName}!
❤️ Love Match: ${lovePercentage}%
⛓️ Destiny brought you two together~

└─ ✨🌬️ ${hakai🗿🉐} ✨ ─┘
`,
            attachment: fs.createReadStream(path)
        };

        api.sendMessage(msg, threadID, () => fs.unlinkSync(path), messageID);
    } catch (error) {
        console.error("Error creating pair image:", error);
        api.sendMessage("An error occurred while creating the pair image. Please check if assets (bg, font) are correctly placed.", threadID, messageID);
    }
};

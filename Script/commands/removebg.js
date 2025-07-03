const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
    name: "removebg",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Perplexity AI",
    description: "Removes the background from an image using remove.bg API.",
    commandCategory: "media",
    usages: "[reply to an image]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
    //
    const apiKey = "19TH2Ec65EkULY28k9fxfHCd"; 

    if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage("অনুগ্রহ করে ব্যাকগ্রাউন্ড রিমুভ করার জন্য একটি ছবিতে রিপ্লাই দিন।", event.threadID, event.messageID);
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const tempImagePath = `${__dirname}/cache/no-bg.png`;

    api.sendMessage("🖼️ আপনার ছবির ব্যাকগ্রাউন্ড রিমুভ করা হচ্ছে, অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন...", event.threadID, event.messageID);

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: {
                image_url: imageUrl,
                size: 'auto'
            },
            headers: {
                'X-Api-Key': apiKey,
            },
            responseType: 'arraybuffer'
        });

        await fs.writeFile(tempImagePath, response.data);

        return api.sendMessage({
            body: "✅ আপনার ছবির ব্যাকগ্রাউন্ড সফলভাবে রিমুভ করা হয়েছে!",
            attachment: fs.createReadStream(tempImagePath)
        }, event.threadID, () => fs.unlinkSync(tempImagePath), event.messageID);

    } catch (error) {
        console.error("Remove.bg API Error:", error.response ? error.response.data.toString() : error.message);
        return api.sendMessage("দুঃখিত, কোনো একটি সমস্যা হয়েছে। API কী ঠিক আছে কিনা অথবা ছবির ফরম্যাট ঠিক আছে কিনা তা পরীক্ষা করুন।", event.threadID, event.messageID);
    }
};

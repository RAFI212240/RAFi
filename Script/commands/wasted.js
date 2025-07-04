const fs = require('fs');
const axios = require('axios'); // এই মডিউলটি ইনস্টল করা আছে কিনা নিশ্চিত করুন: npm install axios

module.exports.config = {
    name: "wasted",
    version: "1.0.0",
    hasPermssion: 0, // সবাই ব্যবহার করতে পারবে
    credits: "Perplexity AI",
    description: "Sends a wasted style image with user's avatar.",
    commandCategory: "image",
    usages: "[reply to bot's message or mention user]", // ব্যবহারের নির্দেশ
    cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;
    let targetUID = senderID; // ডিফল্ট হিসেবে কমান্ড ব্যবহারকারী

    // যদি কোনো ছবিতে রিপ্লাই করা হয়, তবে সেই ছবির মালিকের UID
    if (messageReply && messageReply.senderID) {
        targetUID = messageReply.senderID;
    } 
    // যদি @mention করা হয়, তবে প্রথম মেনশন করা ব্যক্তির UID
    else if (Object.keys(mentions).length > 0) {
        targetUID = Object.keys(mentions)[0];
    } else {
        // যদি কেউ মেনশন বা রিপ্লাই না করে, তবে নিজের ছবি ব্যবহার করবে
        targetUID = senderID;
    }

    api.sendMessage("⏳ Generating wasted image, please wait...", threadID, messageID);

    try {
        // Facebook Graph API ব্যবহার করে ব্যবহারকারীর প্রোফাইল পিকচার লিংক বের করা
        // type=large দিয়ে ভালো মানের ছবি পাওয়া যায়
        const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?type=large`;

        // some-random-api.ml ব্যবহার করে wasted ইমেজ তৈরি করা
        const res = await axios.get(`https://some-random-api.ml/canvas/wasted?avatar=${encodeURIComponent(avatarUrl)}`, { responseType: 'arraybuffer' });

        const path = __dirname + "/cache/wasted.png";
        fs.writeFileSync(path, Buffer.from(res.data, 'utf-8')); // ছবি সেভ করা

        api.sendMessage({
            body: "Here is your wasted image:",
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID); // ছবি পাঠানো এবং ডিলিট করা
    } catch (error) {
        console.error("Error generating wasted image:", error);
        api.sendMessage("❌ Failed to generate wasted image. Please try again later or check the user's avatar.", threadID, messageID);
    }
};
          

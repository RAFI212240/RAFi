const fs = require("fs");
const path = require("path");

// ডেটাবেস ফাইলের পাথ
const dbPath = path.join(__dirname, "..", "cache", "postPoints.json");

// নিশ্চিত করুন ডেটাবেস ফাইল ও ফোল্ডার বিদ্যমান আছে
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), 'utf-8');
}

module.exports.config = {
    name: "addpoint",
    version: "1.0.0",
    hasPermssion: 1, // শুধুমাত্র গ্রুপ অ্যাডমিন
    credits: "Perplexity AI",
    description: "Adds one point to a user for posting.",
    commandCategory: "group",
    usages: "[@mention]",
    cooldowns: 2,
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions } = event;

    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("অনুগ্রহ করে পয়েন্ট দেওয়ার জন্য একজন ব্যবহারকারীকে @mention করুন।", threadID, messageID);
    }

    try {
        let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const mentionedUID = Object.keys(mentions)[0];
        const userName = mentions[mentionedUID];

        if (!data[threadID]) {
            data[threadID] = {};
        }

        if (!data[threadID][mentionedUID]) {
            data[threadID][mentionedUID] = { name: userName.replace('@', ''), points: 0 };
        }
        
        data[threadID][mentionedUID].points += 1;
        data[threadID][mentionedUID].name = userName.replace('@', ''); // নাম আপডেট রাখার জন্য

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), 'utf-8');

        api.sendMessage(`✅ সফলভাবে ${userName}-কে ১ পয়েন্ট দেওয়া হয়েছে। তার মোট পয়েন্ট এখন ${data[threadID][mentionedUID].points}।`, threadID, messageID);
    } catch (e) {
        console.error(e);
        api.sendMessage("পয়েন্ট যোগ করার সময় একটি সমস্যা হয়েছে।", threadID, messageID);
    }
};

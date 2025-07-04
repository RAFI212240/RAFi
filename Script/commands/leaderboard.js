const fs = require("fs");
const path = require("path");

// ডেটাবেস ফাইলের পাথ
const dbPath = path.join(__dirname, "..", "cache", "postPoints.json");

module.exports.config = {
    name: "leaderboard",
    version: "1.0.0",
    hasPermssion: 0, // সবাই ব্যবহার করতে পারবে
    credits: "Perplexity AI",
    description: "Shows the post points leaderboard.",
    commandCategory: "group",
    usages: "",
    cooldowns: 10,
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;

    try {
        if (!fs.existsSync(dbPath)) {
            return api.sendMessage("এই গ্রুপে এখনো কোনো পয়েন্ট ডেটা নেই।", threadID, messageID);
        }

        const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        if (!data[threadID] || Object.keys(data[threadID]).length === 0) {
            return api.sendMessage("এই গ্রুপে এখনো কাউকে পয়েন্ট দেওয়া হয়নি।", threadID, messageID);
        }

        const groupData = data[threadID];
        const sortedUsers = Object.entries(groupData).sort(([, a], [, b]) => b.points - a.points);
        
        let leaderboardMsg = "🏆 | পোস্ট লিডারবোর্ড |\n\n";
        let rank = 1;

        for (const [uid, userData] of sortedUsers.slice(0, 10)) { // সেরা ১০ জনকে দেখানো হবে
            leaderboardMsg += `${rank}. ${userData.name} - ${userData.points} পয়েন্ট\n`;
            rank++;
        }

        api.sendMessage(leaderboardMsg, threadID, messageID);
    } catch (e) {
        console.error(e);
        api.sendMessage("লিডারবোর্ড দেখানোর সময় একটি সমস্যা হয়েছে।", threadID, messageID);
    }
};

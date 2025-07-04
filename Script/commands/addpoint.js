const fs = require("fs");
const path = require("path");

// ডেটাবেস ফাইলের পাথ (এতে কোনো পরিবর্তন নেই)
const dbPath = path.join(__dirname, "..", "cache", "postPoints.json");

// নিশ্চিত করুন ডেটাবেস ফাইল ও ফোল্ডার বিদ্যমান আছে (এতে কোনো পরিবর্তন নেই)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), 'utf-8');
}

module.exports.config = {
    name: "addpoint",
    version: "1.1.0", // সংস্করণ আপডেট করা হলো
    hasPermssion: 1, // শুধুমাত্র গ্রুপ অ্যাডমিন
    credits: "Perplexity AI",
    description: "Adds a specified number of points to a user. Defaults to 1 point.",
    commandCategory: "group",
    usages: "[@mention] [points]", // ব্যবহারবিধি আপডেট করা হলো
    cooldowns: 2,
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions } = event;

    if (Object.keys(mentions).length === 0) {
        return api.sendMessage("অনুগ্রহ করে পয়েন্ট দেওয়ার জন্য একজন ব্যবহারকারীকে @mention করুন।", threadID, messageID);
    }
    
    // আর্গুমেন্ট থেকে পয়েন্টের সংখ্যা বের করা
    // args থেকে mention করা ইউজারদের নাম বাদ দিয়ে শুধু সংখ্যাটি খোঁজা হবে
    const mentionedUID = Object.keys(mentions)[0];
    const pointArg = args.find(arg => !isNaN(parseInt(arg)) && arg !== mentionedUID);
    
    // যদি কোনো সংখ্যা দেওয়া না হয়, তবে ১ পয়েন্ট যোগ হবে
    const pointsToAdd = pointArg ? parseInt(pointArg) : 1;

    // যদি ভুল ইনপুট (যেমন টেক্সট) দেওয়া হয় বা পয়েন্ট ০ বা তার কম হয়
    if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
        return api.sendMessage("অনুগ্রহ করে একটি সঠিক ও ধনাত্মক সংখ্যা দিন। যেমন: /addpoint @user 10", threadID, messageID);
    }

    try {
        let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const userName = mentions[mentionedUID];

        if (!data[threadID]) {
            data[threadID] = {};
        }

        if (!data[threadID][mentionedUID]) {
            data[threadID][mentionedUID] = { name: userName.replace('@', ''), points: 0 };
        }
        
        // নির্দিষ্ট সংখ্যক পয়েন্ট যোগ করা
        data[threadID][mentionedUID].points += pointsToAdd;
        data[threadID][mentionedUID].name = userName.replace('@', ''); // নাম আপডেট রাখার জন্য

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), 'utf-8');

        // সফলতার বার্তা আপডেট করা
        api.sendMessage(`✅ সফলভাবে ${userName}-কে ${pointsToAdd} পয়েন্ট দেওয়া হয়েছে। তার মোট পয়েন্ট এখন ${data[threadID][mentionedUID].points}।`, threadID, messageID);
    } catch (e) {
        console.error(e);
        api.sendMessage("পয়েন্ট যোগ করার সময় একটি সমস্যা হয়েছে।", threadID, messageID);
    }
};
                               

module.exports.config = {
    name: "kick",
    version: "1.1.0",
    hasPermssion: 1, // 1 মানে শুধুমাত্র গ্রুপ অ্যাডমিনরা ব্যবহার করতে পারবে
    credits: "Perplexity AI (Adapted from Mirai Team)",
    description: "Remove a user from the group. You cannot kick other admins.",
    commandCategory: "group",
    usages: "[@mention or UID]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // টার্গেট ইউজারকে খুঁজে বের করা (মেনশন বা UID থেকে)
    let targetID = "";
    if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } else if (args[0]) {
        targetID = args[0];
    } else {
        return api.sendMessage("Please mention a user or provide a UID to kick.", threadID, messageID);
    }
    
    // বট নিজেকে কিক করতে পারবে না
    if (targetID === api.getCurrentUserID()) {
        return api.sendMessage("❌ You cannot kick the bot itself.", threadID, messageID);
    }

    // গ্রুপের অ্যাডমিনদের তালিকা বের করা
    api.getThreadInfo(threadID, (err, info) => {
        if (err) {
            console.error("Error getting thread info:", err);
            return api.sendMessage("An error occurred. Could not fetch group info.", threadID, messageID);
        }

        const adminIDs = info.adminIDs.map(item => item.id);

        // কমান্ড ব্যবহারকারী গ্রুপ অ্যাডমিন কিনা তা নিশ্চিত করা (hasPermssion: 1 এটি করে, তবে ডাবল চেক ভালো)
        if (!adminIDs.includes(senderID)) {
            return api.sendMessage("⚠️ You are not a group admin, so you cannot use this command.", threadID, messageID);
        }

        // টার্গেট ইউজার অ্যাডমিন কিনা তা চেক করা
        if (adminIDs.includes(targetID)) {
            return api.sendMessage("❌ You cannot kick another group admin.", threadID, messageID);
        }

        // সব ঠিক থাকলে ইউজারকে গ্রুপ থেকে রিমুভ করা
        api.removeUserFromGroup(targetID, threadID, (err) => {
            if (err) {
                return api.sendMessage("An error occurred. The user might have already left or could not be kicked.", threadID, messageID);
            }
            api.sendMessage(`✅ User has been successfully kicked from the group.`, threadID, messageID);
        });
    });
};
		

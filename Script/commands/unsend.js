module.exports.config = {
    name: "unsend",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Unsend bot's message.",
    commandCategory: "system",
    usages: "[reply to bot's message]",
    cooldowns: 0
};

module.exports.run = function({ api, event }) {
    if (event.messageReply.senderID != api.getCurrentUserID()) return api.sendMessage("I can't unsend messages from other people.", event.threadID, event.messageID);
    return api.unsendMessage(event.messageReply.messageID);
}

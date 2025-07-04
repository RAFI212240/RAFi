const akinator = require("akinator");
const { start } = require("repl");

const games = new Map();

module.exports.config = {
    name: "akinator",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Perplexity AI",
    description: "Play a game of Akinator.",
    commandCategory: "games",
    usages: "[start/answer/end]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    const option = args[0];

    if (option === "start") {
        if (games.has(threadID)) return api.sendMessage("A game is already in progress in this thread.", threadID, messageID);
        
        const aki = new akinator("en");
        games.set(threadID, { aki, senderID });
        
        await aki.start();
        api.sendMessage(`Akinator Game Started!\n\nQuestion: ${aki.question}\nAnswers: ${aki.answers.join(" / ")}\n\nType /akinator answer [0-4]`, threadID, messageID);
    } 
    else if (option === "answer") {
        if (!games.has(threadID)) return api.sendMessage("No game in progress. Type /akinator start", threadID, messageID);
        if (games.get(threadID).senderID !== senderID) return api.sendMessage("Only the person who started the game can answer.", threadID, messageID);

        const answer = parseInt(args[1]);
        if (isNaN(answer) || answer < 0 || answer > 4) return api.sendMessage("Please provide a valid answer number (0-4).", threadID, messageID);

        const game = games.get(threadID);
        await game.aki.step(answer);

        if (game.aki.progress >= 70 || game.aki.currentStep >= 78) {
            await game.aki.win();
            const guess = game.aki.answers[0];
            api.sendMessage({ body: `I guess it's ${guess.name}!\n${guess.description}`, attachment: await require('axios').get(guess.absolute_picture_path, { responseType: 'stream' }).then(res => res.data) }, threadID, messageID);
            games.delete(threadID);
        } else {
            api.sendMessage(`Question: ${game.aki.question}\nAnswers: ${game.aki.answers.join(" / ")}\nProgress: ${Math.round(game.aki.progress)}%`, threadID, messageID);
        }
    } 
    else if (option === "end") {
        if (!games.has(threadID)) return api.sendMessage("No game to end.", threadID, messageID);
        if (games.get(threadID).senderID !== senderID) return api.sendMessage("Only the person who started the game can end it.", threadID, messageID);
        games.delete(threadID);
        api.sendMessage("Akinator game ended.", threadID, messageID);
    } 
    else {
        api.sendMessage("Usage: /akinator [start/answer/end]", threadID, messageID);
    }
};

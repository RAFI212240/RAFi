const { MessageEntity } = require('node-telegram-bot-api');

module.exports = {
  name: 'help',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Show all available commands',
  guide: 'Use /help to see all commands',
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const commands = bot.commands;

    if (!commands) {
      return bot.sendMessage(chatId, 'Error: Commands not available. Please try again later.');
    }

    const createCommandList = (cmds) => {
      const commandList = Object.entries(cmds)
        .map(([name, cmd]) => `• /${name} - ${cmd.description || ''}`)
        .join('\n');
      
      return `???? *Available Commands*\n\n${commandList}`;
    };

    const addDesign = (text) => {
      const separator = '━'.repeat(30);
      return `${separator}\n${text}\n${separator}`;
    };

    const getBotInfo = async () => {
      try {
        const botInfo = await bot.getMe();
        const ownerId = process.env.OWNER_ID;
        let ownerName = 'Unknown';

        if (ownerId) {
          try {
            const chatMember = await bot.getChatMember(ownerId, ownerId);
            ownerName = chatMember.user.first_name || 'Unknown';
          } catch (error) {
            console.error('Error fetching owner info:', error);
          }
        }

        return `\n\n???? Bot: ${botInfo.first_name}\n???? Owner: ${ownerName}`;
      } catch (error) {
        console.error('Error fetching bot info:', error);
        return '\n\nUnable to fetch bot and owner information.';
      }
    };

    try {
      const commandList = createCommandList(commands);
      const botInfo = await getBotInfo();
      const finalMessage = addDesign(commandList + botInfo);

      await bot.sendMessage(chatId, finalMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in help command:', error);
      await bot.sendMessage(chatId, 'An error occurred while fetching the help information. Please try again later.');
    }
  }
};

import axios from 'axios';
import { Item } from 'rss-parser';

export async function sendTelegramMessage(item: Item) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID is not set');
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const messageText = `<b>${item.title || ''}</b>

${item.contentSnippet || ''}

${item.link || ''}`;

  try {
    await axios.post(apiUrl, {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'HTML',
    });
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}
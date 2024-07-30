import axios from "axios";
import { Item } from "rss-parser";

const DEFAULT_IMAGE_ID = "894192";

function extractImageUrl(html: string | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="?([^"\s]+)"?\s*\/>/i);
  return match ? match[1] : null;
}

function extractPlainTextSummary(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function getItemTags(item: Item): string {
  const tags = item.categories || [];
  const formattedTags = tags.map(
    (tag) =>
      `#${tag
        .trim()
        .replace(/[^a-zA-Z0-9א-ת\s_-]/g, "")
        .replace(/\s+/g, "_")}`
  );

  if (item.link?.includes("breaking-news")) {
    formattedTags.unshift("#מבזק");
  }

  return formattedTags.join(" ");
}

function getInlineKeyboardMarkup(item: Item) {
  return JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "לכתבה המלאה",
          url: item.link,
        },
      ],
    ],
  });
}

export async function sendTelegramMessage(item: Item) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error("Telegram bot token or chat ID is not set");
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/`;
  const client = axios.create({ baseURL: apiUrl });

  const imageUrl = extractImageUrl(item.content);
  const plainTextSummary = extractPlainTextSummary(item.content);
  const formattedTags = getItemTags(item);

  const messageText = `<b>${item.title}</b>

${plainTextSummary}${plainTextSummary ? "\n\n" : ""}${formattedTags}`;

  try {
    if (imageUrl && !imageUrl.includes(DEFAULT_IMAGE_ID)) {
      await client.post("sendPhoto", {
        chat_id: chatId,
        photo: imageUrl,
        caption: messageText,
        parse_mode: "HTML",
        reply_markup: getInlineKeyboardMarkup(item),
      });
    } else {
      await client.post("sendMessage", {
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: getInlineKeyboardMarkup(item),
      });
    }
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}

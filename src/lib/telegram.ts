import axios, { AxiosError } from "axios";
import { CustomItem } from "./customParser";

const DEFAULT_IMAGE_ID = "894192";

function extractImageUrl(html: string | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function extractPlainTextSummary(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function getItemTagsFormat(item: CustomItem): string {
  console.log("Item received:", JSON.stringify(item, null, 2));

  let tagsArray: string[] = [];

  // Extract tags from the Tags element
  if (item.Tags) {
    tagsArray = item.Tags.split(",")
      .map((tag) => tag.trim())
      .map((tag) => tag.replace(/[^a-zA-Z0-9א-ת\s_-]/g, ""))
      .map((tag) => tag.replace(/\s+/g, "_"))
      .map((tag) => `#${tag}`);
  }

  // Add breaking news tag if applicable
  if (item.CategoryID === "1" && item.SubCategoryID === "9") {
    tagsArray.unshift("#מבזק");
  }

  // Add breaking news tag if applicable
  if (item.link?.toString().includes("breaking-news")) {
    tagsArray.unshift("#מבזק");
  }

  console.log("Generated tags:", tagsArray);
  return tagsArray.join(" ");
}

function getInlineKeyboardMarkup(item: CustomItem) {
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

function validateMessageText(text: string): string {
  // Telegram has a limit of 4096 characters for message text
  if (text.length > 4096) {
    console.warn("Message text too long, truncating");
    return text.slice(0, 4093) + "...";
  }
  return text;
}

function validateImageUrl(url: string | null): string | null {
  if (!url) return null;
  // Check if the URL is valid
  try {
    new URL(url);
    return url;
  } catch {
    console.warn("Invalid image URL:", url);
    return null;
  }
}
export async function sendTelegramMessage(item: CustomItem) {
  return;
}
/* export async function sendTelegramMessage(item: CustomItem) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error("Telegram bot token or chat ID is not set");
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/`;
  const client = axios.create({ baseURL: apiUrl });

  const imageUrl = validateImageUrl(extractImageUrl(item.content));
  
  const plainTextSummary = extractPlainTextSummary(item.content);
  const formattedTags = getItemTagsFormat(item);

  const messageText = validateMessageText(`<b>${item.title || ""}</b>

    ${plainTextSummary}${plainTextSummary ? "\n\n" : ""}${formattedTags}`);
  try {
    
    if (imageUrl && !imageUrl.includes(DEFAULT_IMAGE_ID)) {
      console.log("Sending message with photo:", {
        chatId,
        imageUrl,
        messageText,
      });
      await client.post("sendPhoto", {
        chat_id: chatId,
        photo: imageUrl,
        caption: messageText,
        parse_mode: "HTML",
        reply_markup: getInlineKeyboardMarkup(item),
      });
    } else {
      console.log("Sending message without photo:", { chatId, messageText });
      await client.post("sendMessage", {
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: getInlineKeyboardMarkup(item),
      });
    }
    console.log("Message sent successfully");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Axios error sending Telegram message:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
    } else {
      console.error("Error sending Telegram message:", error);
    }
    throw error;
  }
} */

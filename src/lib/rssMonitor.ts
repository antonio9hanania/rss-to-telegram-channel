import Parser from 'rss-parser';
import axios from 'axios';
import { addProcessedItem, getProcessedItems, addLog, isItemProcessed } from './db';

const parser = new Parser();

const RSS_FEEDS = [
  'https://www.maariv.co.il/Rss/RssChadashot',
  'https://www.maariv.co.il/Rss/RssFeedsMivzakiChadashot',
  'https://www.maariv.co.il/Rss/RssFeedsTarbot',
  'https://www.maariv.co.il/Rss/RssFeedsAsakim',
  'https://www.maariv.co.il/Rss/RssFeedsAstrology'
];

const RSS_CHECK_INTERVAL = 5000; // 5 seconds
const TELEGRAM_RATE_LIMIT = 15000; // 15 seconds
const MAX_QUEUE_SIZE = 100;
const DEFAULT_IMAGE_ID = "894192";

let lastMessageTime = 0;
const messageQueue: Parser.Item[] = [];
let rateLimitInterval: NodeJS.Timeout | null = null;

export async function startRssMonitor() {
  // Initial check
  await checkRssFeeds();

  // Set up interval for checking RSS feeds
  setInterval(checkRssFeeds, RSS_CHECK_INTERVAL);
}

async function checkRssFeeds() {
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 10)) {
        if (item.guid && isNewlyPublishedItem(item) && !(await isItemProcessed(item.guid))) {
          await processItem(item);
        }
      }
    } catch (error) {
      await addLog(`Error processing feed ${feedUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function processItem(item: Parser.Item) {
  if (messageQueue.length === 0 && Date.now() - lastMessageTime >= TELEGRAM_RATE_LIMIT) {
    // If queue is empty and rate limit time has passed, send immediately
    await sendTelegramMessage(item);
  } else {
    // Otherwise, add to queue
    if (messageQueue.length < MAX_QUEUE_SIZE) {
      messageQueue.push(item);
      if (!rateLimitInterval) {
        startRateLimitInterval();
      }
    } else {
      await addLog(`Queue full, skipping item: ${item.title}`);
    }
  }
}

function startRateLimitInterval() {
  rateLimitInterval = setInterval(processQueuedMessages, TELEGRAM_RATE_LIMIT);
}

function stopRateLimitInterval() {
  if (rateLimitInterval) {
    clearInterval(rateLimitInterval);
    rateLimitInterval = null;
  }
}

async function processQueuedMessages() {
  if (messageQueue.length > 0) {
    const item = messageQueue.shift()!;
    await sendTelegramMessage(item);
  } else {
    stopRateLimitInterval();
  }
}

function isNewlyPublishedItem(item: Parser.Item): boolean {
  const publishDate = new Date(item.pubDate || Date.now());
  const modifiedDate = new Date(item.isoDate || Date.now());
  return publishDate >= modifiedDate;
}

async function sendTelegramMessage(item: Parser.Item) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID is not set');
  }

  const imageUrl = item.content ? extractImageUrl(item.content) : null;
  const plainTextSummary = item.content ? extractPlainTextSummary(item.content) : '';
  const formattedTags = getItemTagsFormat(item);

  const apiUrl = `https://api.telegram.org/bot${botToken}/`;
  const client = axios.create({ baseURL: apiUrl });

  const messageText = `<b>${item.title || 'No Title'}</b>

${plainTextSummary}${plainTextSummary ? '\n\n' : ''}${formattedTags}`;

  try {
    if (imageUrl && !imageUrl.includes(DEFAULT_IMAGE_ID) && await isImageUrlAccessible(imageUrl)) {
      await client.post('sendPhoto', {
        chat_id: chatId,
        photo: imageUrl,
        caption: messageText,
        parse_mode: 'HTML',
        reply_markup: getInlineKeyboardMarkup(item)
      });
    } else {
      await client.post('sendMessage', {
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        reply_markup: getInlineKeyboardMarkup(item)
      });
    }
    await addProcessedItem(item.guid!, new Date(item.pubDate || Date.now()));
    await addLog(`Sent item: ${item.title}`);
    lastMessageTime = Date.now();
  } catch (error) {
    await addLog(`Error sending Telegram message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    messageQueue.unshift(item); // Put the item back in the queue to retry
    if (!rateLimitInterval) {
      startRateLimitInterval();
    }
  }
}

async function isImageUrlAccessible(imageUrl: string): Promise<boolean> {
  try {
    const response = await axios.head(imageUrl);
    return response.status === 200;
  } catch {
    return false;
  }
}

function getInlineKeyboardMarkup(item: Parser.Item) {
  return JSON.stringify({
    inline_keyboard: [[
      {
        text: "לכתבה המלאה",
        url: item.link
      }
    ]]
  });
}

function extractPlainTextSummary(html: string | undefined): string {
    return html ? html.replace(/<[^>]*>/g, '').trim() : '';
  }
  
  function extractImageUrl(html: string | undefined): string | null {
    if (!html) return null;
    const match = html.match(/<img[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/i);
    return match ? match[1] : null;
  }

function getItemTagsFormat(item: Parser.Item): string {
  const tagsArray: string[] = [];

  // Extract tags from the item's categories or a custom field
  const rawTags = item.categories || [];
  if (rawTags.length > 0) {
    const tagList = rawTags
      .flatMap(tag => tag.split(',')) // Split in case categories are comma-separated
      .map(tag => tag.trim())
      .map(tag => tag.replace(/[^a-zA-Z0-9א-ת\s_-]/g, ""))
      .map(tag => tag.replace(/\s+/g, "_"))
      .map(tag => `#${tag}`);
    tagsArray.push(...tagList);
  }

  // Check for breaking news
  if (item.link?.includes('breaking-news')) {
    tagsArray.unshift('#מבזק');
  }

  return tagsArray.join(' ');
}
import Parser from 'rss-parser';
import axios, { AxiosError } from 'axios';
import https from 'https';
import { addProcessedItem, getProcessedItems, addLog, isItemProcessed } from './db';


interface CustomItem extends Parser.Item {
  Tags?: string;
  CategoryID?: string;
  SubCategoryID?: string;
}

const parser: Parser<Parser.Output<CustomItem>, CustomItem> = new Parser({
  customFields: {
    item: ['Tags', 'CategoryID', 'SubCategoryID'],
  },
});


const RSS_FEEDS = [
  'https://www.maariv.co.il/Rss/RssChadashot',
  'https://www.maariv.co.il/Rss/RssFeedsMivzakiChadashot',
  'https://www.maariv.co.il/Rss/RssFeedsTarbot',
  'https://www.maariv.co.il/Rss/RssFeedsAsakim',
  'https://www.maariv.co.il/Rss/RssFeedsAstrology'
];

const TELEGRAM_RATE_LIMIT = 15000; // 15 seconds in milliseconds
const MAX_QUEUE_SIZE = 200;
const DEFAULT_IMAGE_ID = "894192";

let lastMessageTime = 0;
let monitorInterval: NodeJS.Timeout | null = null;
let queueProcessInterval: NodeJS.Timeout | null = null;

const messageQueue: Parser.Item[] = [];


let monitorStartTime: Date | null = null;

export async function startRssMonitor() {
  if (!isMonitorRunning()) {
    monitorStartTime = new Date();
    //monitorStartTime.setHours(monitorStartTime.getHours() - 4); // 4 hours back
    console.log(`Monitor started at: ${monitorStartTime}`);
    await checkRssFeeds(); // Initial check
    monitorInterval = setInterval(checkRssFeeds, 5000); // Check every 5 seconds
    queueProcessInterval = setInterval(processQueuedMessages, TELEGRAM_RATE_LIMIT); // Process queue every rate limit interval
    console.log('RSS monitor and queue processor started');
  }
}

export function stopRssMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  if (queueProcessInterval) {
    clearInterval(queueProcessInterval);
    queueProcessInterval = null;
  }
  monitorStartTime = null;
  console.log('RSS monitor and queue processor stopped');
}

export function isMonitorRunning(): boolean {
  return monitorInterval !== null && queueProcessInterval !== null;
}

async function checkRssFeeds() {
  console.log('Checking RSS feeds, monitor start time:', monitorStartTime);
  console.log('Current queue size:', messageQueue.length);

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      console.log(`Found ${feed.items.length} items in feed`);
      for (const item of feed.items.slice(0, 10)) {
        console.log(`Checking item: ${item.title}, pubDate: ${item.pubDate}`);
        const isNew = isNewlyPublishedItem(item);
        const isProcessed = item.guid ? await isItemProcessed(item.guid) : false;
        console.log(`Is new: ${isNew}, Is processed: ${isProcessed}, Has guid: ${Boolean(item.guid)}`);
        if (item.guid && isNew && !isProcessed) {
          console.log(`New item found: ${item.title}`);
          if (messageQueue.length < MAX_QUEUE_SIZE) {
            // Check if the item is already in the queue
            const isInQueue = messageQueue.some(queuedItem => queuedItem.guid === item.guid);
            if (!isInQueue) {
              messageQueue.push(item);
              console.log(`Added item to queue: ${item.title}`);
              console.log('New queue size:', messageQueue.length);
            } else {
              console.log(`Item already in queue, skipping: ${item.title}`);
            }
          } else {
            console.log(`Queue full (${MAX_QUEUE_SIZE} items), skipping item: ${item.title}`);
            await addLog(`Queue full (${MAX_QUEUE_SIZE} items), skipping item: ${item.title}`);
          }
        } else {
          console.log(`Skipping item: ${item.title} (already processed: ${isProcessed}, not new: ${!isNew}, no guid: ${!item.guid})`);
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feedUrl}:`, error);
      await addLog(`Error processing feed ${feedUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


async function processQueuedMessages() {
  console.log('Processing queued messages');
  console.log('Current queue size:', messageQueue.length);
  console.log('Time since last message:', Date.now() - lastMessageTime);

  if (messageQueue.length > 0 && Date.now() - lastMessageTime >= TELEGRAM_RATE_LIMIT) {

    // Remove duplicates from the queue
    const uniqueQueue = messageQueue.filter((item, index, self) =>
      index === self.findIndex((t) => t.guid === item.guid)
    );

    if (uniqueQueue.length < messageQueue.length) {
      console.log(`Removed ${messageQueue.length - uniqueQueue.length} duplicate items from the queue`);
      messageQueue.length = 0;
      messageQueue.push(...uniqueQueue);
    }
   
    const item = messageQueue.shift()!;
    console.log(`Processing item from queue: ${item.title}`);
    await sendTelegramMessage(item);
    lastMessageTime = Date.now();
    console.log('Message sent, new queue size:', messageQueue.length);
  } else {
    console.log('No messages processed (queue empty or rate limit not met)');
  }
}

function isNewlyPublishedItem(item: CustomItem): boolean {
  if (!monitorStartTime) return false;
  const publishDate = new Date(item.pubDate || item.isoDate || Date.now());
  console.log(`Item: ${item.title}, Publish Date: ${publishDate}, Monitor Start Time: ${monitorStartTime}`);
  return publishDate >= monitorStartTime;
}


async function sendTelegramMessage(item: Parser.Item) {
  console.log(`Attempting to send message for item: ${item.title}`);
  
  // Double-check if the item has already been processed
  if (item.guid && await isItemProcessed(item.guid)) {
    console.log(`Item ${item.title} has already been processed, skipping.`);
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID is not set');
    throw new Error('Telegram bot token or chat ID is not set');
  }

  const imageUrl = item.content ? extractImageUrl(item.content) : null;
  const plainTextSummary = item.content ? extractPlainTextSummary(item.content) : '';
  const formattedTags = getItemTagsFormat(item);

  const apiUrl = `https://api.telegram.org/bot${botToken}/`;
  const client = axios.create({
    baseURL: apiUrl,
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });

  const messageText = `<b>${item.title || ''}</b>

${plainTextSummary}${plainTextSummary ? '\n\n' : ''}${formattedTags}`;

  try {
    let isImageAccessible = false;
    if (imageUrl) {
      console.log(`Checking image accessibility: ${imageUrl}`);
      isImageAccessible = await isImageUrlAccessible(imageUrl);
      console.log(`Image accessibility result: ${isImageAccessible}`);
    }

    if (imageUrl && isImageAccessible && !imageUrl.includes(DEFAULT_IMAGE_ID)) {
      console.log('Sending message with image');
      await client.post('sendPhoto', {
        chat_id: chatId,
        photo: imageUrl,
        caption: messageText,
        parse_mode: 'HTML',
        reply_markup: getInlineKeyboardMarkup(item)
      });
    } else {
      console.log('Sending message without image');
      await client.post('sendMessage', {
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        reply_markup: getInlineKeyboardMarkup(item)
      });
    }
    console.log('Message sent successfully');
    if (item.guid) {
      await addProcessedItem(item.guid, new Date(item.pubDate || item.isoDate || Date.now()));
    } else {
      console.warn('Item has no guid, cannot mark as processed');
    }
    await addLog(`Sent item: ${item.title}`);
    lastMessageTime = Date.now();
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending Telegram message:', error.response?.data || error.message);
      await addLog(`Error sending Telegram message: ${error.message}`);
    } else {
      console.error('Unknown error sending Telegram message:', error);
      await addLog(`Unknown error sending Telegram message`);
    }
    messageQueue.unshift(item); // Put the item back in the queue to retry
  }
}
async function isImageUrlAccessible(imageUrl: string): Promise<boolean> {
  try {
    const response = await axios.head(imageUrl, {
      timeout: 5000, // 5 seconds timeout
      validateStatus: (status) => status === 200, // Only consider 200 as success
    });
    return true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`Error checking image accessibility for ${imageUrl}:`, error.message);
    } else {
      console.error(`Unknown error checking image accessibility for ${imageUrl}`);
    }
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
  const match = html.match(/<img[^>]+src=['"]?([^'"\s]+)['"]?\s*\/>/i);
  return match ? match[1] : null;
}

function getItemTagsFormat(item: CustomItem): string {

  console.log('Item received:', JSON.stringify(item, null, 2));
  let tagsArray: string[] = [];

  if (item.Tags) {
    tagsArray = item.Tags.split(',')
      .map(tag => tag.trim())
      .map(tag => tag.replace(/[^a-zA-Z0-9א-ת\s_-]/g, ""))
      .map(tag => tag.replace(/[\s-]+/g, "_"))
      .map(tag => `#${tag}`);
  }

  if (item.link?.includes('breaking-news')) {
    tagsArray.unshift('#מבזק');
    console.log('Breaking news tag added');
  }

  console.log('Generated tags:', tagsArray);
  return tagsArray.join(' ');
}
export async function manualTrigger() {
  console.log('Manual trigger initiated');
  await checkRssFeeds();
  while (messageQueue.length > 0) {
    await processQueuedMessages();
    await new Promise(resolve => setTimeout(resolve, TELEGRAM_RATE_LIMIT));
  }
  console.log('Manual trigger completed');
}
import axios from "axios";
import Parser from "rss-parser";
import { addProcessedItem, isItemProcessed, addLog } from "./db";
import { sendTelegramMessage } from "./telegram";

const parser = new Parser();

const RSS_FEEDS = [
  "https://www.maariv.co.il/Rss/RssChadashot",
  "https://www.maariv.co.il/Rss/RssFeedsMivzakiChadashot",
  "https://www.maariv.co.il/Rss/RssFeedsTarbot",
  "https://www.maariv.co.il/Rss/RssFeedsAsakim",
  "https://www.maariv.co.il/Rss/RssFeedsAstrology",
];

const TELEGRAM_RATE_LIMIT = 15000; // 15 seconds
const MAX_QUEUE_SIZE = 250;

let monitorStatus: "working" | "stopped" = "stopped";
let monitorInterval: NodeJS.Timeout | null = null;
let messageQueue: Parser.Item[] = [];
let lastMessageTime = 0;
let monitorStartTime: Date | null = null;
let lastCheckTime: Date | null = null;

export function isMonitorRunning(): boolean {
  return monitorInterval !== null;
}

export function getMonitorStatus() {
  return {
    status: monitorStatus,
    lastCheckTime: lastCheckTime,
  };
}

async function checkRssFeeds() {
  console.log("Checking RSS feeds");
  const currentCheckTime = new Date();
  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedUrl}`);
      const response = await axios.get(feedUrl, { timeout: 60000 });
      const feed = await parser.parseString(response.data);
      for (const item of feed.items.slice(0, 10)) {
        if (
          item.guid &&
          isNewlyPublishedItem(item) &&
          !(await isItemProcessed(item.guid))
        ) {
          console.log(`New item found: ${item.title}`);
          if (messageQueue.length < MAX_QUEUE_SIZE) {
            messageQueue.push(item);
            console.log(`Added item to queue: ${item.title}`);
          } else {
            console.log(`Queue full, skipping item: ${item.title}`);
            await addLog(
              `Queue full (${MAX_QUEUE_SIZE} items), skipping item: ${item.title}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feedUrl}:`, error);
      await addLog(
        `Error processing feed ${feedUrl}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  lastCheckTime = currentCheckTime;
}

export function startRssMonitor() {
  if (monitorStatus === "stopped") {
    monitorStatus = "working";
    monitorStartTime = new Date();
    lastCheckTime = monitorStartTime;
    checkRssFeeds(); // Initial check
    monitorInterval = setInterval(checkRssFeeds, 5000); // Check every 5 seconds
    setInterval(processQueuedMessages, TELEGRAM_RATE_LIMIT); // Process queue every 15 seconds
    console.log("RSS monitor started");
  }
}

export function stopRssMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  monitorStatus = "stopped";
  monitorStartTime = null;
  lastCheckTime = null;
  console.log("RSS monitor stopped");
}

function isNewlyPublishedItem(item: Parser.Item): boolean {
  if (!monitorStartTime || !lastCheckTime) return false;
  const publishDate = new Date(item.pubDate || item.isoDate || Date.now());
  const modifiedDate = new Date(item.isoDate || item.pubDate || Date.now());
  return (
    publishDate >= modifiedDate &&
    publishDate > lastCheckTime &&
    publishDate >= monitorStartTime
  );
}
async function processQueuedMessages() {
  if (
    messageQueue.length > 0 &&
    Date.now() - lastMessageTime >= TELEGRAM_RATE_LIMIT
  ) {
    const item = messageQueue.shift()!;
    await sendTelegramMessage(item);
    lastMessageTime = Date.now();
  }
}

startRssMonitor();

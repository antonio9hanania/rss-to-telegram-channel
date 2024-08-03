import axios from "axios";
import { customParser, postProcessItems, CustomItem } from "./customParser";

import { addProcessedItem, isItemProcessed, addLog } from "./db";
import { sendTelegramMessage } from "./telegram";
import { json } from "stream/consumers";

//const parser = new Parser();

const RSS_FEEDS = [
  "https://www.maariv.co.il/Rss/RssChadashot",
  "https://www.maariv.co.il/Rss/RssFeedsMivzakiChadashot",
  "https://www.maariv.co.il/Rss/RssFeedsTarbot",
  "https://www.maariv.co.il/Rss/RssFeedsAsakim",
  "https://www.maariv.co.il/Rss/RssFeedsAstrology",
];

const TELEGRAM_RATE_LIMIT = 15000; // 15 seconds
const MAX_QUEUE_SIZE = 250;
const RSS_CHECK_INTERVAL = 5000;

let monitorStatus: "working" | "stopped" = "stopped";
let monitorInterval: NodeJS.Timeout | null = null;
let messageQueue: CustomItem[] = [];
let lastMessageTime = 0;
let monitorStartTime: Date | null = null;
let lastCheckTime: Date | null = null;

export function startRssMonitor() {
  if (monitorStatus === "stopped") {
    monitorStatus = "working";
    monitorStartTime = convertToIsraelTime(new Date());
    //monitorStartTime.setHours(monitorStartTime.getHours() - 4);
    lastCheckTime = monitorStartTime;
    checkRssFeeds(); // Initial check
    monitorInterval = setInterval(checkRssFeeds, RSS_CHECK_INTERVAL); // Check every 5 seconds
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
  const currentCheckTime = convertToIsraelTime(new Date());
  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedUrl}`);
      const response = await axios.get(feedUrl, { timeout: 60000 });
      const feed = await customParser.parseString(response.data);
      const processedItems = postProcessItems(feed.items);

      for (const item of processedItems.slice(0, 10)) {
        if (
          item.guid &&
          isNewlyPublishedItem(item) &&
          !(await isItemProcessed(item.guid))
        ) {
          console.log(`New item found: ${item.title}`);
          if (messageQueue.length < MAX_QUEUE_SIZE) {
            const isInQueue = messageQueue.some(
              (queuedItem) => queuedItem.guid === item.guid
            );
            if (!isInQueue) {
              messageQueue.push(item);
              console.log(`Added item to queue: ${item.title}`);
              console.log("New queue size:", messageQueue.length);
            } else {
              console.log(`Item already in queue, skipping: ${item.title}`);
            }
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
  console.log(`lastCheckTime: ${lastCheckTime.toString()}`);
}

function isNewlyPublishedItem(item: CustomItem): boolean {
  if (!monitorStartTime || !lastCheckTime) return false;

  const publishDate = convertToIsraelTime(new Date(item.pubDate || Date.now()));
  const modifiedDate = convertToIsraelTime(
    new Date(item.UpdateDate || Date.now())
  );
  const startTime = convertToIsraelTime(monitorStartTime);

  console.log(`item url ${item.link}:
    published at ${item.pubDate}, israel time: ${publishDate},
    modifiedDate at ${item.pubDate}, israel time: ${modifiedDate},
    monitor startTime at ${monitorStartTime}, israel time: ${startTime}`);

  console.log(
    `is newly published ? ${
      publishDate >= modifiedDate && publishDate >= startTime
    }`
  );

  return publishDate >= modifiedDate && publishDate >= monitorStartTime;
}
async function processQueuedMessages() {
  const currentTime = convertToIsraelTime(new Date()).getTime();

  if (
    messageQueue.length > 0 &&
    currentTime - lastMessageTime >= TELEGRAM_RATE_LIMIT
  ) {
    // Remove duplicates from the queue
    const uniqueQueue = messageQueue.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.guid === item.guid)
    );

    if (uniqueQueue.length < messageQueue.length) {
      console.log(
        `Removed ${
          messageQueue.length - uniqueQueue.length
        } duplicate items from the queue`
      );
      messageQueue.length = 0;
      messageQueue.push(...uniqueQueue);
    }
    const item = messageQueue.shift()!;
    await sendTelegramMessage(item);
    await addProcessedItem(
      item.guid,
      convertToIsraelTime(new Date(item.pubDate || Date.now()))
    );
    lastMessageTime = currentTime;
  }
}

function convertToIsraelTime(date: Date | string): Date {
  const inputDate = new Date(date);

  // Create a date object in the Israel time zone
  const israelDate = new Date(
    inputDate.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );

  // Adjust for the difference between local time and Israel time
  const offset = israelDate.getTime() - inputDate.getTime();

  // Create a new date object with the correct offset
  return new Date(inputDate.getTime() + offset);
}

startRssMonitor();

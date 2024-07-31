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

let monitorStatus: "working" | "stopped" = "stopped";
let monitorInterval: NodeJS.Timeout | null = null;
let lastCheckTime: Date | null = null;

export function isMonitorRunning(): boolean {
  return monitorInterval !== null;
}

export function getMonitorStatus() {
  return monitorStatus;
}

async function checkRssFeeds() {
  console.log("Checking RSS feeds");
  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedUrl}`);
      const response = await axios.get(feedUrl, { timeout: 60000 }); // Increase timeout to 60 seconds
      const feed = await parser.parseString(response.data);
      for (const item of feed.items.slice(0, 10)) {
        if (item.guid && !(await isItemProcessed(item.guid))) {
          await sendTelegramMessage(item);
          await addProcessedItem(
            item.guid,
            new Date(item.pubDate || item.isoDate || Date.now())
          );
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
}

export function startRssMonitor() {
  if (monitorStatus === "stopped") {
    monitorStatus = "working";
    checkRssFeeds(); // Initial check
    monitorInterval = setInterval(checkRssFeeds, 300000); // Check every 5 minutes
    console.log("RSS monitor started");
  }
}

export function stopRssMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  monitorStatus = "stopped";
  console.log("RSS monitor stopped");
}

startRssMonitor();

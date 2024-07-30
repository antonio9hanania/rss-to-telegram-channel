import Parser from 'rss-parser';
import { addProcessedItem, isItemProcessed, addLog } from './db';
import { sendTelegramMessage } from './telegram';

const parser = new Parser();

const RSS_FEEDS = [
  'https://www.maariv.co.il/Rss/RssChadashot',
  'https://www.maariv.co.il/Rss/RssFeedsMivzakiChadashot',
  'https://www.maariv.co.il/Rss/RssFeedsTarbot',
  'https://www.maariv.co.il/Rss/RssFeedsAsakim',
  'https://www.maariv.co.il/Rss/RssFeedsAstrology'
];

let monitorInterval: NodeJS.Timeout | null = null;
let lastCheckTime: Date | null = null;

export function isMonitorRunning(): boolean {
  return monitorInterval !== null;
}

export function getMonitorStatus() {
  return {
    isRunning: isMonitorRunning(),
    lastCheckTime,
  };
}

async function checkRssFeeds() {
  console.log('Checking RSS feeds');
  lastCheckTime = new Date();

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 10)) {
        if (item.guid && !(await isItemProcessed(item.guid))) {
          console.log(`New item found: ${item.title}`);
          await sendTelegramMessage(item);
          await addProcessedItem(item.guid, new Date(item.pubDate || item.isoDate || Date.now()));
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feedUrl}:`, error);
      await addLog(`Error processing feed ${feedUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export function startRssMonitor() {
  if (!monitorInterval) {
    checkRssFeeds(); // Initial check
    monitorInterval = setInterval(checkRssFeeds, 5000); // Check every 5 seconds
    console.log('RSS monitor started');
  }
}

export function stopRssMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('RSS monitor stopped');
  }
}
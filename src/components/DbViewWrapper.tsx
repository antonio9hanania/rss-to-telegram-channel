import { getProcessedItems } from "@/lib/db";
import DbView from "./DbView";
import { formatIsraelTime } from "@/lib/utils";

export default async function DbViewWrapper() {
  const rawItems = await getProcessedItems();
  const items = rawItems.map((item) => ({
    ...item,
    published_at: formatIsraelTime(item.published_at),
    processed_at: formatIsraelTime(item.processed_at),
  }));
  return <DbView items={items} />;
}

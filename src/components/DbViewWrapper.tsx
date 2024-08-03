import { getProcessedItems } from "@/lib/db";
import { convertToIsraelTime } from "@/lib/utils";
import DbView from "./DbView";

export const revalidate = 30; // Revalidate every 30 seconds

export default async function DbViewWrapper() {
  const rawItems = await getProcessedItems();
  const items = rawItems.map((item) => ({
    ...item,
    published_at: convertToIsraelTime(item.published_at),
    processed_at: convertToIsraelTime(item.processed_at),
  }));

  return <DbView items={items} />;
}

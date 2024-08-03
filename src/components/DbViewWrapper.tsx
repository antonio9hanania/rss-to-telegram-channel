import { getProcessedItems } from "@/lib/db";
import DbView from "./DbView";

export default async function DbViewWrapper() {
  const items = await getProcessedItems();

  if (!items) {
    throw new Error("Failed to fetch items");
  }

  return <DbView items={items} />;
}

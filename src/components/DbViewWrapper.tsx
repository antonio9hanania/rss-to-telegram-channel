// src/components/DbViewWrapper.tsx
import { getProcessedItems } from "@/lib/db";
import DbView from "./DbView";

export default async function DbViewWrapper() {
  const processedItems = await getProcessedItems();

  return <DbView initialProcessedItems={processedItems} />;
}

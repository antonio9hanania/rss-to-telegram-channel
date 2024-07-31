import { getProcessedItems } from "@/lib/db";

export default async function ProcessedItemsPage() {
  const items = await getProcessedItems();
  return (
    <div>
      <h1>Processed Items</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item.item_id}</li>
        ))}
      </ul>
    </div>
  );
}

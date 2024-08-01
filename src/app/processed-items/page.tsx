import { getProcessedItems } from "@/lib/db";

export default async function ProcessedItemsPage() {
  try {
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
  } catch (error) {
    console.error("Error fetching processed items:", error);
    return <div>Error loading processed items. Please try again later.</div>;
  }
}

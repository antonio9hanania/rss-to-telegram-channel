import { Suspense } from "react";
import DbViewWrapper from "@/components/DbViewWrapper";

export default function ProcessedItemsPage() {
  return (
    <div>
      <h1>Processed Items</h1>
      <Suspense fallback={<div>Loading processed items...</div>}>
        <DbViewWrapper />
      </Suspense>
    </div>
  );
}

import LogsViewWrapper from "@/components/LogsViewWrapper";
import { Suspense } from "react";

export default async function LogsPage() {
  try {
    return (
      <div>
        <h1>Logs</h1>
        <Suspense fallback={<div>Loading processed items...</div>}>
          <LogsViewWrapper />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching logs:", error);
    return <div>Error loading logs. Please try again later.</div>;
  }
}

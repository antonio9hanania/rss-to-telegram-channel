import { NextResponse } from "next/server";
import { startRssMonitor } from "@/lib/rssMonitor";

export async function POST() {
  try {
    await startRssMonitor();
    return NextResponse.json({ success: true, message: "RSS monitor started" });
  } catch (error) {
    console.error("Error starting RSS monitor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start RSS monitor" },
      { status: 500 }
    );
  }
}

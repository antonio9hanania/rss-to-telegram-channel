export interface MonitorStatus {
  status: "working" | "stopped";
  lastCheckTime: Date | null;
}

export interface FeedStatus {
  itemsProcessed: number;
  errors: number;
}

export interface MonitorStatus {
  status: "working" | "stopped";
  lastCheckTime: string;
}

export interface FeedStatus {
  itemsProcessed: number;
  errors: number;
}

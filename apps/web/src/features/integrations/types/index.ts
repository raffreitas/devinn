export type ChannelType = "Booking" | "Airbnb";

export type SyncStatusType = "NeverSynced" | "Syncing" | "Success" | "Failed";

export interface SyncStatus {
  status: SyncStatusType;
  lastSyncAt?: string;
  nextSyncAt?: string;
  importedCount?: number;
  errorMessage?: string;
}

export interface ChannelIntegration {
  id: string;
  channelType: ChannelType;
  iCalUrl: string;
  roomId: string;
  roomName: string;
  roomCategoryName: string;
  isActive: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelIntegrationRequest {
  channelType: ChannelType;
  iCalUrl: string;
  roomId: string;
}

export interface PreviewICalFeedRequest {
  channelType: ChannelType;
  iCalUrl: string;
}

export interface PreviewICalFeedResponse {
  isValid: boolean;
  eventCount: number;
  message: string;
}

export interface UpdateChannelIntegrationRequest {
  iCalUrl?: string;
  roomId?: string;
  isActive?: boolean;
}

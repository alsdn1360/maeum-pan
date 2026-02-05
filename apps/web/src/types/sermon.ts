export interface SermonData {
  videoId: string;
  summary: string;
  createdAt: string;
  originalUrl: string;
  savedAt: string;
  isNonSermon?: boolean;
}

export interface Sermon {
  id: string;
  data: SermonData;
}

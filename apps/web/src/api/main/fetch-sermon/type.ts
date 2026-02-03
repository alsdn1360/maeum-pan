export interface FetchSermonResponse {
  videoId: string;
  summary: string;
  createdAt: string;
  isNonSermon: boolean;
}

export interface FetchSermonRequest {
  url: string;
  languages?: string[];
}

export interface FetchSermonResponse {
  videoId: string;
  summary: string;
  sermonDate: string; // YYYY-MM-DD
  isNonSermon: boolean;
}

export interface FetchSermonRequest {
  url: string;
  languages?: string[];
}

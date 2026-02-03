export interface FetchSermonResponse {
  videoId: string;
  summary: string;
  sermonDate: string; // YYYY-MM-DD
}

export interface FetchSermonRequest {
  url: string;
  languages?: string[];
}

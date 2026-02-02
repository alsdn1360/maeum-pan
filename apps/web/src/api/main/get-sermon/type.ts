export interface TranscriptResponse {
  videoId: string;
  summary: string;
  sermonDate: string; // YYYY-MM-DD
}

export interface TranscriptRequest {
  url: string;
  languages?: string[];
}

export interface PostSermonResponse {
  videoId: string;
  summary: string;
  originalUrl: string;
  createdAt: string;
  isNonSermon: boolean;
}

export interface PostSermonRequest {
  url: string;
  languages?: string[];
}

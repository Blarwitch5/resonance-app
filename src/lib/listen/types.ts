import type { MediaFormat } from "@/lib/collection/types";

export interface SharedPressingSnapshot {
  token: string;
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  coverThumbUrl: string | null;
  sharerName: string | null;
}

export interface ListenPressingView {
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  coverThumbUrl: string | null;
  sharerName: string | null;
}

export interface SharedShelfItem {
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  coverThumbUrl: string | null;
}

export interface SharedShelfSnapshot {
  token: string;
  headline: string;
  items: SharedShelfItem[];
  truncated: boolean;
  sharerName: string | null;
}

export const SHARE_SHELF_MAX = 48;

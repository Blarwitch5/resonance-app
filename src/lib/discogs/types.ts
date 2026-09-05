export interface DiscogsSearchHit {
  id: number;
  title: string;
  year?: string | number;
  thumb?: string;
  cover_image?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  barcode?: string[];
  catno?: string;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  year?: number;
  artists?: Array<{ name: string }>;
  labels?: Array<{ name: string; catno?: string }>;
  genres?: string[];
  styles?: string[];
  images?: Array<{ uri: string; uri150?: string; type?: string }>;
  formats?: Array<{ name: string }>;
  identifiers?: Array<{ type: string; value: string }>;
  country?: string;
  extraartists?: Array<{ name?: string; role?: string }>;
  tracklist?: DiscogsTrack[];
}

export interface DiscogsTrack {
  position?: string;
  title?: string;
  duration?: string;
  type_?: string;
  sub_tracks?: DiscogsTrack[];
}

export interface DiscogsBasicInformation {
  id: number;
  title: string;
  year?: number;
  thumb?: string;
  cover_image?: string;
  formats?: Array<{ name?: string }>;
  labels?: Array<{ name?: string; catno?: string }>;
  artists?: Array<{ name?: string }>;
  genres?: string[];
  styles?: string[];
}

export interface DiscogsCollectionEntry {
  basic_information?: DiscogsBasicInformation;
}

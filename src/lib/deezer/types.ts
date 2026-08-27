export interface DeezerAlbum {
  id?: number;
  title?: string;
  artist?: { name?: string };
}

export interface DeezerTrack {
  title?: string;
  preview?: string;
}

export interface DeezerList<T> {
  data?: T[];
  error?: { message?: string; code?: number };
}

export interface DeezerErrorBody {
  error?: { message?: string; code?: number };
}

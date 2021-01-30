export interface Banner {
    targetId: number;
    url: string;
    imageUrl: string;
  }

export interface HotTag {
  id: number;
  name: string;
  position: number;
}

// singer
export interface Singer {
  id: number;
  name: string;
  picUrl: string;
  albumSize: number;
}

// Song
export interface Song {
  id: number;
  name: string;
  url: string;
  ar: Singer[];
  al: { id: number; name: string; picUrl: string };
  dt: number;
}

//SongSheet
export interface SongSheet {
  id: number;
  name: string;
  picUrl: string;
  playCount: number;
  tracks: Song[];
}
export interface MediaObj {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

export interface MediaUploadData {
  photos: string[];
  videos: string[];
  documents: string[];
}

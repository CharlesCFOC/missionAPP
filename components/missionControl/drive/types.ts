export type DriveFileType = "document" | "image" | "video" | "other";

export interface DriveFile {
  id: string;
  name: string;
  parentId: string | null;
  type: DriveFileType;
  size: string;
  date: string;
  previewUrl?: string;
  isObjectUrl?: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId: string | null;
  subfolders: DriveFolder[];
  files: DriveFile[];
}

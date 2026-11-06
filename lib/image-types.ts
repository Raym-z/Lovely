export type LovelyImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  mimeType: string;
  bytes: number;
  originalFilename: string | null;
  createdAt: string;
  canDelete?: boolean;
};

export type ImageScope = "library" | "page";

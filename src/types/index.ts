export interface PortraitImage {
  id: string;
  url: string;
  style: PortraitStyle;
  status: "pending" | "generating" | "completed" | "error";
  error?: string;
}

export type PortraitStyle =
  | "executive" | "founder" | "statesperson" | "outdoors"
  | "artist" | "athlete"
  | "scholar" | "minimalist" | "romantic" | "maverick";

export interface PortraitSession {
  id: string;
  images: PortraitImage[];
  createdAt: Date;
}

export interface CreditPackage {
  credits: number;
  price: number;
  label: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

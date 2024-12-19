import { Prettify } from "viem";

export type FileToUpload = {
  file: File;
  localUrl: string;
};

export type UploadedFile = {
  url: string;
  isDeleted?: boolean;
};

export type PlatformFile = Prettify<FileToUpload | UploadedFile>;

export type CarImageToUpload = Prettify<
  FileToUpload & {
    isPrimary?: boolean;
  }
>;

export type UploadedCarImage = Prettify<
  UploadedFile & {
    isPrimary?: boolean;
  }
>;

export function isUploadedCarImage(file: PlatformFile): file is UploadedCarImage {
  return "url" in file;
}

export type PlatformCarImage = Prettify<CarImageToUpload | UploadedCarImage>;

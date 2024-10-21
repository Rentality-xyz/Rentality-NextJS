export type FileToUpload = {
  file: File;
  localUrl: string;
};

export type UploadedFile = {
  url: string;
  isDeleted?: boolean;
};

export type PlatformFile = FileToUpload | UploadedFile;

export type CarImageToUpload = FileToUpload & {
  isPrimary?: boolean;
};

export type UploadedCarImage = UploadedFile & {
  isPrimary?: boolean;
};

export function isUploadedCarImage(file: PlatformFile): file is UploadedCarImage {
  return "url" in file;
}

export type PlatformCarImage = CarImageToUpload | UploadedCarImage;

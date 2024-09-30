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
export type PlatformCarImage = CarImageToUpload | UploadedCarImage;

export const resizeImage = async (file: File, maxSize: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const scaleFactor = maxSize / Math.max(img.width, img.height);
      const width = img.width * scaleFactor;
      const height = img.height * scaleFactor;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob as BlobPart], file.name, {
            type: "image/png",
          });
          resolve(resizedFile);
        },
        "image/png",
        1
      );
    };

    img.onerror = reject;
  });
};

export const resizeImageToSquare = async (file: File, size: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scaleFactor = size / Math.max(img.width, img.height);
      const scaledWidth = img.width * scaleFactor;
      const scaledHeight = img.height * scaleFactor;
      ctx.drawImage(img, (size - scaledWidth) / 2, (size - scaledHeight) / 2, scaledWidth, scaledHeight);
      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob as BlobPart], file.name, {
            type: "image/png",
          });
          resolve(resizedFile);
        },
        "image/png",
        1
      );
    };

    img.onerror = reject;
  });
};

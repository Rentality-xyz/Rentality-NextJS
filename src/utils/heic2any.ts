import heic2any from "heic2any";
import { FileToUpload } from "@/model/FileToUpload";

export default function convertHeicToPng(heicFile: File): Promise<FileToUpload> {
  return heic2any({
    blob: heicFile,
    toType: "image/png",
  })
    .then(function (resultBlob) {
      const url = URL.createObjectURL(resultBlob as Blob);
      const heicFileName = heicFile.name;
      const fileNameWithoutExtension = heicFileName.substring(0, heicFileName.lastIndexOf("."));
      const pngFile = new File([resultBlob as Blob], fileNameWithoutExtension + ".png", { type: "image/png" });
      return { file: pngFile, localUrl: url };
    })
    .catch((error) => {
      console.log("[convertHeicToPng][" + error.code + "][" + error.message + "]");
      throw new Error("Conversion failed"); // Выбрасываем исключение
    });
}

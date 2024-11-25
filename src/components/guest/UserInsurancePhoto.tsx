import { PlatformFile } from "@/model/FileToUpload";
import { cn } from "@/utils";
import { resizeImage } from "@/utils/image";
import { isEmpty } from "@/utils/string";
import Image from "next/image";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

export function UserInsurancePhoto({
  insurancePhoto: photo,
  onInsurancePhotoChanged: onPhotoChanged,
}: {
  insurancePhoto?: PlatformFile;
  onInsurancePhotoChanged: (newValue: PlatformFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const photoUrl = photo !== undefined ? ("url" in photo ? photo.url : photo.localUrl) : "";

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    let file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      alert("Image only");
      return;
    }

    file = await resizeImage(file, 1000);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileUrl = event.target?.result as string;

      const fileNameExt = file.name.slice(file.name.lastIndexOf(".") + 1);
      if (fileNameExt == "heic") {
        const convertHeicToPng = await import("@/utils/heic2any");
        const convertedFile = await convertHeicToPng.default(file);
        onPhotoChanged(convertedFile);
      } else {
        onPhotoChanged({ file: file, localUrl: fileUrl });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleImageClick() {
    inputRef.current?.click();
  }

  function handleEditClick() {
    inputRef.current?.click();
  }

  function handleDeleteClick() {
    if (!photo) return;
    onPhotoChanged({ url: "", isDeleted: true });
  }

  return (
    <div className="flex flex-row gap-4">
      {!isEmpty(photoUrl) && (
        <div className="relative h-40 w-48 overflow-hidden rounded-2xl">
          <Image className="h-full w-full object-cover" width={1000} height={1000} src={photoUrl} alt="" />
          <button
            className="absolute bottom-0 left-0 z-10 bg-rentality-additional px-2"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            {t("common.delete")}
          </button>
          <button
            className="absolute bottom-0 right-0 bg-rentality-additional px-2"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
          >
            {t("common.edit")}
          </button>
        </div>
      )}
      <div
        className={cn(
          "h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 bg-opacity-40 bg-[url('../images/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat",
          !isEmpty(photoUrl) ? "hidden" : ""
        )}
      >
        <div className="h-full w-full" onClick={handleImageClick} />
        <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
      </div>
    </div>
  );
}

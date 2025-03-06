import { PlatformFile } from "@/model/FileToUpload";
import { cn } from "@/utils";
import { resizeImage } from "@/utils/image";
import { isEmpty } from "@/utils/string";
import Image from "next/image";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import ic_edit_car from "@/images/ic_edit_car_white.png";
import ic_delete from "@/images/ic_delete_white.svg";

export function UserInsurancePhoto({
  insurancePhoto: photo,
  onInsurancePhotoChanged: onPhotoChanged,
  onDelete,
}: {
  insurancePhoto?: PlatformFile;
  onInsurancePhotoChanged: (newValue: PlatformFile) => void;
  onDelete?: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const photoUrl = photo !== undefined ? ("url" in photo ? photo.url : photo.localUrl) : "";

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    let file = e.target.files[0];

    // image/jpeg, image/png
    if (file.type.startsWith("image/")) {
      file = await resizeImage(file, 1000);
    } else if (file.size > 5 * 1024 * 1024) {
      alert("File is too big");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileUrl = event.target?.result as string;

      if (file.type === "image/heic" || file.name.endsWith(".heic")) {
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

  async function handleDeleteClick() {
    if (!photo) return;

    if (onDelete !== undefined && "url" in photo && !isEmpty(photo.url)) {
      await onDelete();
    } else {
      onPhotoChanged({ url: "", isDeleted: true });
    }
  }

  return (
    <div className="flex flex-row gap-4">
      {!isEmpty(photoUrl) && (
        <div className="relative h-40 w-48 overflow-hidden rounded-2xl">
          <Image className="h-full w-full object-cover" width={1000} height={1000} src={photoUrl} alt="" />
          <button
            className="absolute bottom-1 right-1 z-10 rounded-2xl bg-[#000000] bg-opacity-75 p-1"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            <Image src={ic_delete} alt="" className="w-[22px]" />
          </button>
          <button
            className="absolute right-1 top-1 rounded-2xl bg-[#000000] bg-opacity-75 p-1"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
          >
            <Image src={ic_edit_car} alt="" className="w-[22px]" />
          </button>
        </div>
      )}
      <div
        className={cn(
          "border-gradient h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-transparent bg-[url('/images/icons/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat",
          !isEmpty(photoUrl) ? "hidden" : ""
        )}
      >
        <div className="h-full w-full" onClick={handleImageClick} />
        <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
      </div>
    </div>
  );
}

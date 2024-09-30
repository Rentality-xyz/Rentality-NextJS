import React, { useRef } from "react";
import Image from "next/image";
import { resizeImage } from "@/utils/image";
import { PlatformCarImage } from "@/model/FileToUpload";
import RntCheckbox from "@/components/common/rntCheckbox";
import { useTranslation } from "react-i18next";

function CarAddPhoto({
  carImages,
  onCarImagesChanged: onCarImagesChange,
  onJsonFileLoaded: onOtherTypeFileLoad,
}: {
  carImages: PlatformCarImage[];
  onCarImagesChanged: (newValue: PlatformCarImage[]) => void;
  onJsonFileLoaded?: (file: File) => Promise<void>;
}) {
  const MAX_ADD_IMAGE = 10;
  const inputRef = useRef<HTMLInputElement>(null);
  const currentIndexRef = useRef<number>(-1);
  const { t } = useTranslation();

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    const currentIndex = currentIndexRef.current;
    let file = e.target.files[0];

    if (file.type === "application/json") {
      if (onOtherTypeFileLoad) {
        await onOtherTypeFileLoad(file);
      }
      return;
    }

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
      const isNewFile = currentIndex === -1;

      if (isNewFile) {
        const fileNameExt = file.name.slice(file.name.lastIndexOf(".") + 1);
        if (fileNameExt == "heic") {
          const convertHeicToPng = await import("@/utils/heic2any");
          const convertedFile = await convertHeicToPng.default(file);
          onCarImagesChange([...carImages, { ...convertedFile, isPrimary: carImages.length === 0 }]);
        } else {
          onCarImagesChange([...carImages, { file: file, localUrl: fileUrl, isPrimary: carImages.length === 0 }]);
        }
      } else {
        if ("url" in carImages[currentIndex]) {
          const updatedCarImages = carImages.map((value, i) => {
            return i === currentIndex ? { ...value, isDeleted: true } : value;
          });
          updatedCarImages.splice(currentIndex, 0, {
            file: file,
            localUrl: fileUrl,
            isPrimary: updatedCarImages[currentIndex].isPrimary,
          });
        } else {
          onCarImagesChange(
            carImages.map((value, index) => {
              return index === currentIndex ? { file: file, localUrl: fileUrl, isPrimary: value.isPrimary } : value;
            })
          );
        }
      }
    };
    reader.readAsDataURL(file);
  }

  function handleImageClick() {
    currentIndexRef.current = -1;
    inputRef.current?.click();
  }

  function handleEditClick(index: number) {
    currentIndexRef.current = index;
    inputRef.current?.click();
  }

  function handleDeleteClick(index: number) {
    if ("url" in carImages[index]) {
      onCarImagesChange(
        carImages.map((value, i) => {
          return i === index ? { ...value, isDeleted: true } : value;
        })
      );
    } else {
      onCarImagesChange(carImages.filter((_, innerIndex) => innerIndex !== index));
    }
  }

  function handleCheckboxClick(index: number) {
    onCarImagesChange(
      carImages.map((f, i) => (i === index ? { ...f, isPrimary: !(f.isPrimary ?? false) } : { ...f, isPrimary: false }))
    );
  }

  return (
    <div className="my-2">
      <p className="mb-1 mt-2 pl-3.5">{t("vehicles.upload_photos_title")}</p>
      <div className="mt-4 flex flex-row gap-4">
        {carImages
          .filter((i) => "file" in i || !i.isDeleted)
          .map((carImage, index) => {
            const carImageUrl = "url" in carImage ? carImage.url : carImage.localUrl;
            return (
              <div key={index} className="relative">
                <div className="relative h-40 w-48 overflow-hidden rounded-2xl">
                  <Image className="h-full w-full object-cover" width={1000} height={1000} src={carImageUrl} alt="" />
                  <button
                    className="absolute bottom-0 left-0 z-10 bg-rentality-additional px-2"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(index);
                    }}
                  >
                    {t("common.delete")}
                  </button>
                  <button
                    className="absolute bottom-0 right-0 bg-rentality-additional px-2"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(index);
                    }}
                  >
                    {t("common.edit")}
                  </button>
                </div>
                <RntCheckbox
                  className="absolute -left-2 -top-2"
                  checked={carImage.isPrimary}
                  onChange={(e) => handleCheckboxClick(index)}
                />
              </div>
            );
          })}
        {carImages.length < MAX_ADD_IMAGE ? (
          <div className="h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 bg-opacity-40 bg-[url('../images/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat">
            <div className="h-full w-full" onClick={handleImageClick} />
            <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CarAddPhoto;

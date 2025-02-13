import React, { useRef, useState } from "react";
import Image from "next/image";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { PlatformCarImage } from "@/model/FileToUpload";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import RntCheckbox from "@/components/common/rntCheckbox";
import { resizeImage } from "@/utils/image";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import imgCircleBtn from "@/images/img_circle_for_transparent_btn.svg";
import RntButton from "@/components/common/rntButton";

const heightCroppedCanvas = 744;
const widthCroppedCanvas = 1242;

function CarAddPhoto({
  carImages,
  readOnly,
  onCarImagesChanged: onCarImagesChange,
  onJsonFileLoaded: onOtherTypeFileLoad,
}: {
  carImages: PlatformCarImage[];
  readOnly: boolean;
  onCarImagesChanged: (newValue: PlatformCarImage[]) => void;
  onJsonFileLoaded?: (file: File) => Promise<void>;
}) {
  const MAX_ADD_IMAGE = 10;
  const inputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);
  const currentIndexRef = useRef<number>(-1);
  const { t } = useTranslation();

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

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
      let fileUrl = event.target?.result as string;

      if (file.type === "image/heic" || file.name.endsWith(".heic")) {
        const convertHeicToPng = await import("@/utils/heic2any");
        const convertedFile = await convertHeicToPng.default(file);
        setCropImage(convertedFile.localUrl);
      } else {
        setCropImage(fileUrl);
      }
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }

  async function handleCrop() {
    if (!cropperRef.current) return;

    const croppedCanvas = cropperRef.current?.cropper.getCroppedCanvas({
      width: widthCroppedCanvas,
      height: heightCroppedCanvas,
    });

    croppedCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
      const fileUrl = URL.createObjectURL(croppedFile);

      onCarImagesChange([...carImages, { file: croppedFile, localUrl: fileUrl, isPrimary: carImages.length === 0 }]);
      setShowCropper(false);
      setCropImage(null);
    }, "image/jpeg");
  }

  function handleCancelCrop() {
    setShowCropper(false);
    setCropImage(null);
  }

  function handleImageClick() {
    if (readOnly) return;
    currentIndexRef.current = -1;
    inputRef.current?.click();
  }

  function handleDeleteClick(index: number) {
    const newImages = carImages.filter((_, i) => i !== index);
    onCarImagesChange(newImages);
  }

  function handleEditClick(index: number) {
    const carImage = carImages[index];
    const imageUrl = "url" in carImage ? carImage.url : carImage.localUrl;
    setCropImage(imageUrl);
    setShowCropper(true);
    currentIndexRef.current = index;
  }

  function handleCheckboxClick(index: number) {
    const newImages = carImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onCarImagesChange(newImages);
  }

  return (
    <div className="my-2 flex flex-col gap-4">
      <p className="pl-4">{t("vehicles.upload_photos_title")}</p>
      <div className="flex w-full flex-row gap-4 overflow-x-auto p-2 pb-4">
        {carImages.map((carImage, index) => {
          const carImageUrl = "url" in carImage ? carImage.url : carImage.localUrl;
          return (
            <div key={index} className={cn("relative")}>
              <div className="relative h-40 w-48 overflow-hidden rounded-2xl">
                <Image className="h-full w-full object-cover" width={1000} height={1000} src={carImageUrl} alt="" />
                <button
                  className="absolute bottom-0 left-0 z-10 bg-rentality-additional px-2"
                  type="button"
                  disabled={readOnly}
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
                  disabled={readOnly}
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
                readOnly={readOnly}
                onChange={() => handleCheckboxClick(index)}
              />
            </div>
          );
        })}
        {carImages.filter((i) => "file" in i || !i.isDeleted).length < MAX_ADD_IMAGE && (
          <div className="h-40 w-48 min-w-[12rem] cursor-pointer overflow-hidden rounded-2xl bg-gray-200/40 bg-[url('../images/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat">
            <div className="h-full w-full" onClick={handleImageClick} />
            <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
          </div>
        )}
      </div>

      {showCropper && cropImage && (
        <div className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-70">
          <div className="border-gradient rounded-lg bg-rentality-bg-left-sidebar p-4">
            <Cropper
              ref={cropperRef}
              src={cropImage}
              className={`w-full lg:h-[${heightCroppedCanvas / 2}px] lg:w-[${widthCroppedCanvas / 2}px]`}
              aspectRatio={widthCroppedCanvas / heightCroppedCanvas}
              viewMode={1}
              guides={false}
              autoCropArea={1}
            />
            <div className="mt-4 flex justify-between">
              <RntButtonTransparent className="w-32" onClick={handleCancelCrop}>
                <div className="flex items-center justify-center text-lg font-semibold text-white">
                  <span className="ml-4 w-full">{t("cropper.cancel")}</span>
                  <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
                </div>
              </RntButtonTransparent>
              <RntButton className="w-32" onClick={handleCrop}>
                <div className="flex items-center justify-center text-lg font-semibold text-white">
                  <span className="ml-4 w-full">{t("cropper.crop")}</span>
                  <span className="ml-auto mr-4">●</span>
                </div>
              </RntButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarAddPhoto;

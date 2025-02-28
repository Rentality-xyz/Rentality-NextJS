import React, { useRef, useState } from "react";
import Image from "next/image";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { PlatformCarImage } from "@/model/FileToUpload";
import { useTranslation } from "react-i18next";
import { resizeImage } from "@/utils/image";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import imgCircleBtn from "@/images/img_circle_for_transparent_btn.svg";
import RntButton from "@/components/common/rntButton";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import ic_delete from "@/images/ic_delete_white.svg";
import ic_edit_car from "@/images/ic_edit_car_white.png";

const heightCroppedCanvas = 720;
const widthCroppedCanvas = 1280;

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

      if (currentIndexRef.current === -1) {
        onCarImagesChange([...carImages, { file: croppedFile, localUrl: fileUrl, isPrimary: carImages.length === 0 }]);
      } else {
        const newImages = carImages.map((img, i) =>
          i === currentIndexRef.current
            ? { ...img, file: croppedFile, localUrl: fileUrl, isPrimary: img.isPrimary }
            : img
        );
        onCarImagesChange(newImages);
      }

      handleCancelCrop();
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
    currentIndexRef.current = index;
    inputRef.current?.click();
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
      <ScrollingHorizontally>
        {carImages.map((carImage, index) => {
          const carImageUrl = "localUrl" in carImage ? carImage.localUrl : carImage.url;
          return (
            <div key={index} className="relative">
              <div className="relative h-[162px] w-[288px] overflow-hidden rounded-2xl">
                <Image className="h-full w-full object-cover" width={1000} height={1000} src={carImageUrl} alt="" />
                <button
                  className="absolute bottom-1 right-1 z-10 rounded-2xl bg-[#000000] bg-opacity-75 p-1"
                  type="button"
                  disabled={readOnly}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(index);
                  }}
                >
                  <Image src={ic_delete} alt="" className="w-[22px]" />
                </button>
                <button
                  className="absolute right-1 top-1 rounded-2xl bg-[#000000] bg-opacity-75 p-1"
                  type="button"
                  disabled={readOnly}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(index);
                  }}
                >
                  <Image src={ic_edit_car} alt="" className="w-[22px]" />
                </button>
              </div>
              <div
                className="group absolute left-1 top-1 flex cursor-pointer flex-row items-center gap-2 rounded-2xl bg-[#000000] bg-opacity-75 p-1 transition-colors"
                onClick={() => handleCheckboxClick(index)}
                role="button"
              >
                <span className="pointer-events-none absolute left-[50px] top-[-4px] mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black bg-opacity-75 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  main
                </span>
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-transparent transition-all`}
                >
                  {carImage.isPrimary && <div className="h-2 w-2 rounded-full bg-white"></div>}
                </div>
              </div>
            </div>
          );
        })}
        {carImages.filter((i) => "localUrl" in i || !i.isDeleted).length < MAX_ADD_IMAGE && (
          <div className="border-gradient h-[162px] min-w-[288px] cursor-pointer overflow-hidden rounded-2xl bg-transparent bg-[url('../images/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat">
            <div className="h-full w-full" onClick={handleImageClick} />
            <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
          </div>
        )}
      </ScrollingHorizontally>

      {showCropper && cropImage && (
        <div className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-70">
          <div className="border-gradient rounded-lg bg-rentality-bg-left-sidebar p-4">
            <Cropper
              ref={cropperRef}
              src={cropImage}
              className="h-auto w-full md:h-[360px] md:w-[640px]"
              aspectRatio={widthCroppedCanvas / heightCroppedCanvas}
              viewMode={1}
              guides={false}
              autoCropArea={1}
              cropBoxResizable={false}
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

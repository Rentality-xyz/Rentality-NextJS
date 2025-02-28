import React, { useRef } from "react";
import Image from "next/image";
import { resizeImage } from "@/utils/image";
import { FileToUpload } from "@/model/FileToUpload";
import ic_edit_car from "@/images/ic_edit_car_white.png";

function ClaimAddPhoto({
  filesToUpload,
  setFilesToUpload,
}: {
  filesToUpload: FileToUpload[];
  setFilesToUpload: (newValue: FileToUpload[]) => void;
}) {
  const MAX_ADD_IMAGE = 5;
  const inputRef = useRef<HTMLInputElement>(null);
  const currentIndexRef = useRef<number>(-1);

  const handleImageClick = () => {
    currentIndexRef.current = -1;
    inputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const currentIndex = currentIndexRef.current;
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
      let fileUrl = event.target?.result as string;

      if (file.type === "image/heic" || file.name.endsWith(".heic")) {
        const convertHeicToPng = await import("@/utils/heic2any");
        const convertedFile = await convertHeicToPng.default(file);
        file = convertedFile.file;
        fileUrl = convertedFile.localUrl;
      }

      if (currentIndex === -1) {
        setFilesToUpload([...filesToUpload, { file: file, localUrl: fileUrl }]);
      } else {
        const newFilesToUpload = filesToUpload.map((value, index) => {
          return index === currentIndex ? { file: file, localUrl: fileUrl } : value;
        });
        setFilesToUpload(newFilesToUpload);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (index: number) => {
    currentIndexRef.current = index;
    inputRef.current?.click();
  };

  return (
    <div className="my-2">
      <p className="mb-1 mt-2 pl-3.5">Up to 5 photos possible</p>
      <div className="flex flex-row gap-4">
        {filesToUpload.map((fileToUpload, index) => {
          return (
            <div key={index} className="relative h-40 w-48 overflow-hidden rounded-2xl">
              <Image
                className="h-full w-full object-cover"
                width={1000}
                height={1000}
                src={fileToUpload.localUrl}
                alt=""
              />
              <button
                className="absolute right-1 top-1 rounded-2xl bg-[#000000] bg-opacity-75 p-1"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(index);
                }}
              >
                <Image src={ic_edit_car} alt="" className="w-[22px]" />
              </button>
            </div>
          );
        })}
        {filesToUpload.length < MAX_ADD_IMAGE ? (
          <div className="border-gradient h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-transparent bg-[url('../images/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat">
            <div className="h-full w-full" onClick={handleImageClick} />
            <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ClaimAddPhoto;

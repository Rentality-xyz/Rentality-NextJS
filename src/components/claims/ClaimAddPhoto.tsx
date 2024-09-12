import React, { useRef } from "react";
import Image from "next/image";
import { resizeImage } from "@/utils/image";
import { FileToUpload } from "@/model/FileToUpload";

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

  const handleEditClick = (index: number) => {
    currentIndexRef.current = index;
    inputRef.current?.click();
  };

  const handleImageClick = () => {
    currentIndexRef.current = -1;
    inputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

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
      const fileUrl = event.target?.result as string;

      if (currentIndex === -1) {
        const fileNameExt = file.name.substr(file.name.lastIndexOf(".") + 1);
        if (fileNameExt == "heic") {
          const convertHeicToPng = await import("@/utils/heic2any");
          const convertedFile = await convertHeicToPng.default(file);
          setFilesToUpload([...filesToUpload, convertedFile]);
        } else {
          setFilesToUpload([...filesToUpload, { file: file, localUrl: fileUrl }]);
        }
      } else {
        const newFilesToUpload = filesToUpload.map((value, index) => {
          return index === currentIndex ? { file: file, localUrl: fileUrl } : value;
        });
        setFilesToUpload(newFilesToUpload);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="my-2">
      <p className="mb-1 mt-2 pl-3.5">Up to 5 photos possible</p>
      <div className="flex flex-row gap-4">
        {filesToUpload.map((fileToUpload, index) => {
          return (
            <div
              key={index}
              className="relative h-40 w-48 overflow-hidden rounded-2xl"
              onClick={() => {
                handleEditClick(index);
              }}
            >
              {fileToUpload.file.type.startsWith("image/") ? (
                <Image
                  className="h-full w-full object-cover"
                  width={1000}
                  height={1000}
                  src={fileToUpload.localUrl}
                  alt=""
                />
              ) : (
                <div className="relative h-full w-full bg-gray-200 bg-opacity-60 bg-center bg-no-repeat">
                  <span className="absolute bottom-4 w-full text-center">{fileToUpload.file.name}</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-rentality-additional px-2">edit</div>
            </div>
          );
        })}
        {filesToUpload.length < MAX_ADD_IMAGE ? (
          <div className="h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 bg-opacity-40 bg-[url('../images/add_circle_outline_white_48dp.svg')] bg-center bg-no-repeat">
            <div className="h-full w-full" onClick={handleImageClick} />
            <input className="hidden" type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ClaimAddPhoto;

// TODO Transate
import { cn } from "@/utils";
import { isEmpty } from "@/utils/string";
import React from "react";
import RntButton from "./rntButton";
import Image from "next/image";
import { useRntDialogs } from "@/contexts/rntDialogsContext";

type RntGalleryLinkPros = {
  photos: string[];
  titleCallback?: (photos: string[]) => string;
  titleClassNameCallback?: (photos: string[]) => string;
};

function RntGalleryLink({
  photos,
  titleCallback = (photos) => {
    const noEmptyPhotos = photos.filter((i) => !isEmpty(i));
    return noEmptyPhotos.length > 1
      ? `See ${noEmptyPhotos.length} photo(s)`
      : noEmptyPhotos.length > 0
        ? `See ${noEmptyPhotos.length} photo`
        : "No photo";
  },
  titleClassNameCallback = (photos) => {
    const noEmptyPhotos = photos.filter((i) => !isEmpty(i));
    return noEmptyPhotos.length > 0 ? "text-rentality-secondary cursor-pointer" : "text-gray-500 ";
  },
}: RntGalleryLinkPros) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const noEmptyPhotos = photos.filter((i) => !isEmpty(i));

  function handleClick() {
    if (noEmptyPhotos.length === 0) return;

    showCustomDialog(<RntGalleryDialog photos={photos} handleBackClick={hideDialogs} />);
  }

  return (
    <span className={cn("", titleClassNameCallback(photos))} onClick={handleClick}>
      {titleCallback(photos)}
    </span>
  );
}

function RntGalleryDialog({ photos, handleBackClick }: { photos: string[]; handleBackClick: () => void }) {
  return (
    <div className="my-2 flex flex-col">
      <h2>View photos</h2>
      <div className="mt-4 flex flex-row gap-4">
        {photos.map((photo, index) => {
          return (
            <>
              <div
                key={index}
                className="h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 bg-opacity-80"
                onClick={() => window.open(photo)}
              >
                <Image className="h-full w-full object-cover" width={1000} height={1000} src={photo} alt="" />
              </div>
            </>
          );
        })}
      </div>
      <RntButton className="mt-8 w-40 self-center" onClick={handleBackClick}>
        Back
      </RntButton>
    </div>
  );
}

export default RntGalleryLink;

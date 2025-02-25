// TODO Transate
import { cn } from "@/utils";
import { isEmpty } from "@/utils/string";
import React, { useState } from "react";
import ImageCarouselDialog from "@/components/createTrip/ImageCarouselDialog";

type RntGalleryLinkPros = {
  photos: string[];
  titleCallback?: (photos: string[]) => string;
  titleClassNameCallback?: (photos: string[]) => string;
};

const defaultSliderState = {
  isOpen: false,
  images: [],
  title: "",
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
  const noEmptyPhotos = photos.filter((i) => !isEmpty(i));

  const [sliderState, setSliderState] = useState<{ isOpen: boolean; images: string[]; title: string }>(
    defaultSliderState
  );

  function handleShowPhotos(urls: string[]) {
    if (urls.length === 0) return;

    setSliderState({
      isOpen: true,
      images: urls,
      title: "Photo of insurance",
    });
  }

  function handleCloseSlider() {
    setSliderState(defaultSliderState);
  }

  function handleClick() {
    if (noEmptyPhotos.length === 0) return;
    handleShowPhotos(photos);
  }

  return (
    <>
      <span className={cn("", titleClassNameCallback(photos))} onClick={handleClick}>
        {titleCallback(photos)}
      </span>
      <ImageCarouselDialog
        images={sliderState.images}
        isOpen={sliderState.isOpen}
        title={sliderState.title}
        isActualImageSize={true}
        onClose={handleCloseSlider}
      />
    </>
  );
}

export default RntGalleryLink;

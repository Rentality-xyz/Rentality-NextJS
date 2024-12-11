import React, { useRef, useState } from "react";
import RntButton from "../common/rntButton";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface ImageCarouselDialogPros {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

function ImageCarouselDialog({ images, isOpen, onClose }: ImageCarouselDialogPros) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const { t } = useTranslation();

  if (!isOpen || !images || images.length === 0) return null;

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextImage();
    } else if (touchEndX.current - touchStartX.current > 50) {
      prevImage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="relative flex h-[90vh] w-full max-w-6xl flex-col items-center justify-between gap-4 overflow-hidden rounded-[20px] bg-rentality-additional-dark p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl text-rentality-secondary">{t("create_trip.car_photo_title")}</h2>

        <div className="relative flex h-full min-h-[12rem] w-full items-center justify-center">
          <button
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-rentality-button-light"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            ❮
          </button>

          <div
            className="flex h-full w-full items-center justify-center"
            onClick={(e) => {
              e.clientX > window.innerWidth / 2 ? nextImage() : prevImage();
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image src={images[currentIndex]} alt={`Car image ${currentIndex + 1}`} layout="fill" objectFit="contain" />
          </div>

          <button
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-rentality-button-light"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            ❯
          </button>
        </div>

        <div className="my-4 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-3 rounded-full transition-colors duration-200 ${
                currentIndex === index ? "bg-rentality-secondary" : "bg-rentality-button-light"
              }`}
              onClick={() => setCurrentIndex(index)}
            ></button>
          ))}
        </div>

        <RntButton onClick={onClose}>{t("common.back")}</RntButton>
      </div>
    </div>
  );
}
export default ImageCarouselDialog;

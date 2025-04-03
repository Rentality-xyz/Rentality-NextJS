import Image from "next/image";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/virtual";
// import required modules
import { EffectFade, Navigation, Pagination, Virtual } from "swiper/modules";

interface ImageCarouselDialogPros {
  images: string[];
  isOpen: boolean;
  title: String;
  isActualImageSize?: boolean;
  onClose: () => void;
}

function ImageCarouselDialog({ images, isOpen, title, isActualImageSize = false, onClose }: ImageCarouselDialogPros) {
  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="border-gradient h-[40%] w-[100%] rounded-[20px] bg-rentality-bg-left-sidebar p-4 sm:h-[80%] lg:h-[510px] lg:w-[800px] xl:h-[582px] xl:w-[928px] 2xl:h-[720px] 2xl:w-[1280px] fullHD:h-[800px] fullHD:w-[1312px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="ml-[2.4%] w-full text-center text-2xl font-semibold text-white/70">{title}</h2>
          <Image
            height={28}
            width={28}
            src={"/images/icons/ic-menu-burge-close-white-20.svg"}
            alt=""
            className="cursor-pointer opacity-70"
            onClick={onClose}
          />
        </div>

        {/* Swiper для экранов больше md */}
        <div className="hidden h-[90%] lg:block xl:h-[92%] 2xl:h-[94%]">
          <Swiper
            spaceBetween={30}
            effect={isActualImageSize ? "" : "fade"}
            navigation={true}
            pagination={{ clickable: true }}
            modules={[EffectFade, Navigation, Pagination, Virtual]}
            className="h-full rounded-[20px]"
            virtual
          >
            {images.map((src, index) => (
              <SwiperSlide
                key={src}
                virtualIndex={index}
                className={`flex items-center justify-center ${isActualImageSize && "overflow-auto"}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className={
                    isActualImageSize
                      ? "relative flex h-full w-full items-center justify-center object-contain"
                      : "object-cover"
                  }
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Swiper для экранов md и меньше */}
        <div className="block h-[80%] sm:h-[84%] lg:hidden">
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination, Virtual]}
            className="h-full rounded-[20px]"
            virtual
          >
            {images.map((src, index) => (
              <SwiperSlide
                key={src}
                virtualIndex={index}
                className={`flex items-center justify-center ${isActualImageSize && "overflow-auto"}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className={
                    isActualImageSize
                      ? "relative flex h-full w-full items-center justify-center object-contain"
                      : "object-cover"
                  }
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default ImageCarouselDialog;

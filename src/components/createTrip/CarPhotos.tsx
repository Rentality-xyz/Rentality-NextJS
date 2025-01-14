import Image from "next/image";
import RntButton from "../common/rntButton";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import ImageCarouselDialog from "./ImageCarouselDialog";
import useToggleState from "@/hooks/useToggleState";

export function CarPhotos({ carPhotos }: { carPhotos: string[] }) {
  const { t } = useTranslation();
  const [isCarouselOpen, toogleCarouselOpen] = useToggleState(false);

  function handleAllPhotoClick() {
    toogleCarouselOpen(true);
  }

  return (
    <div className="relative mx-auto w-full overflow-hidden">
      <CarPhotosLayout carPhotos={carPhotos} />
      <RntButton className="absolute bottom-2 right-4 h-10 w-fit px-2" onClick={handleAllPhotoClick}>
        {carPhotos.length > 6
          ? t("create_trip.all_n_photo", { count: carPhotos.length })
          : t("create_trip.see_in_full")}
      </RntButton>
      <ImageCarouselDialog images={carPhotos} isOpen={isCarouselOpen} onClose={() => toogleCarouselOpen(false)} />
    </div>
  );
}

function CarPhotosLayout({ carPhotos }: { carPhotos: string[] }) {
  if (carPhotos.length <= 1) return <CarPhoto carImageUrl={carPhotos[0]} />;
  if (carPhotos.length === 2)
    return (
      <div className="grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CarPhoto carImageUrl={carPhotos[0]} />
        <CarPhoto carImageUrl={carPhotos[1]} />
      </div>
    );
  if (carPhotos.length === 3)
    return (
      <div className="grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CarPhoto carImageUrl={carPhotos[0]} />
        <div className="grid grid-rows-2">
          <CarPhoto carImageUrl={carPhotos[1]} />
          <CarPhoto carImageUrl={carPhotos[2]} />
        </div>
      </div>
    );
  if (carPhotos.length === 4)
    return (
      <div className="grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CarPhoto carImageUrl={carPhotos[0]} />
        <div className="grid grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
          <CarPhoto carImageUrl={carPhotos[1]} />
          <div className="grid grid-cols-2">
            <CarPhoto carImageUrl={carPhotos[2]} />
            <CarPhoto carImageUrl={carPhotos[3]} />
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <CarPhoto carImageUrl={carPhotos[0]} />
      <div className="grid grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={cn("grid", carPhotos.length > 4 ? "grid-cols-2" : "")}>
          {carPhotos[1] && <CarPhoto carImageUrl={carPhotos[1]} />}
          {carPhotos[4] && <CarPhoto carImageUrl={carPhotos[4]} />}
        </div>
        <div className={cn("grid", carPhotos.length > 5 ? "grid-cols-3" : carPhotos.length > 3 ? "grid-cols-2" : "")}>
          {carPhotos[2] && <CarPhoto carImageUrl={carPhotos[2]} />}
          {carPhotos[3] && <CarPhoto carImageUrl={carPhotos[3]} />}
          {carPhotos[5] && <CarPhoto carImageUrl={carPhotos[5]} />}
        </div>
      </div>
    </div>
  );
}

function CarPhoto({ carImageUrl }: { carImageUrl: string }) {
  return (
    <Image
      src={carImageUrl}
      alt=""
      width={1000}
      height={1000}
      className="h-full max-h-[24rem] w-full border-[1px] border-white bg-gray-500 object-cover object-center fullHD:max-h-[32rem]"
    />

    // <div
    //   style={{ backgroundImage: `url(${carImageUrl})` }}
    //   className="max-h-[20rem] min-h-[12rem] w-full flex-shrink-0 border-[1px] border-white bg-cover bg-center"
    // ></div>
  );
}

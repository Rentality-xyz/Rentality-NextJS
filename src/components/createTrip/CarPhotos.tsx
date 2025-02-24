import Image from "next/image";
import RntButton from "../common/rntButton";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import ImageCarouselDialog from "./ImageCarouselDialog";
import useToggleState from "@/hooks/useToggleState";
import { SearchCarFilters } from "@/model/SearchCarRequest";
import { SearchCarInfoDetails } from "@/model/SearchCarsResult";

export function CarPhotos({ carPhotos, carInfo }: { carPhotos: string[]; carInfo: SearchCarInfoDetails }) {
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
      <ImageCarouselDialog
        images={carPhotos}
        isOpen={isCarouselOpen}
        title={`${carInfo.brand} ${carInfo.model} - ${carInfo.year}`}
        onClose={() => toogleCarouselOpen(false)}
      />
    </div>
  );
}

function CarPhotosLayout({ carPhotos }: { carPhotos: string[] }) {
  if (carPhotos.length <= 1) return <CarPhoto carImageUrl={carPhotos[0]} />;
  if (carPhotos.length === 2)
    return (
      <div className="grid h-full max-h-[22rem] w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] fullHD:max-h-[30rem]">
        <CarPhoto className="border-r" carImageUrl={carPhotos[0]} />
        <CarPhoto carImageUrl={carPhotos[1]} />
      </div>
    );
  if (carPhotos.length === 3)
    return (
      <div className="mac:max-h-[326px] grid max-h-[128px] w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:max-h-[226px] xl:max-h-[226px] 2xl:max-h-[290px] fullHD:min-h-[388px]">
        <CarPhoto className="border-r" carImageUrl={carPhotos[0]} />
        <div className="mac:max-h-[326px] grid max-h-[128px] grid-rows-2 sm:max-h-[226px] xl:max-h-[226px] 2xl:max-h-[290px] fullHD:min-h-[388px]">
          <CarPhoto className="border-b" carImageUrl={carPhotos[1]} />
          <CarPhoto carImageUrl={carPhotos[2]} />
        </div>
      </div>
    );
  if (carPhotos.length === 4)
    return (
      <div className="mac:max-h-[326px] grid max-h-[128px] w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:max-h-[226px] xl:max-h-[226px] 2xl:max-h-[290px] fullHD:max-h-[388px]">
        <CarPhoto className="border-r" carImageUrl={carPhotos[0]} />
        <div className="mac:max-h-[326px] grid max-h-[128px] grid-rows-[minmax(0,3fr)_minmax(0,2fr)] sm:max-h-[226px] xl:max-h-[226px] 2xl:max-h-[290px] fullHD:max-h-[388px]">
          <CarPhoto className="border-b" carImageUrl={carPhotos[1]} />
          <div className="grid grid-cols-2">
            <CarPhoto className="border-r" carImageUrl={carPhotos[2]} />
            <CarPhoto carImageUrl={carPhotos[3]} />
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid h-full max-h-[22rem] w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] fullHD:max-h-[30rem]">
      <CarPhoto className="border-r" carImageUrl={carPhotos[0]} />
      <div className="grid max-h-[22rem] grid-rows-[minmax(0,3fr)_minmax(0,2fr)] fullHD:max-h-[30rem]">
        <div className={cn("grid", carPhotos.length > 4 ? "grid-cols-2" : "")}>
          {carPhotos[1] && <CarPhoto className="border-b border-r" carImageUrl={carPhotos[1]} />}
          {carPhotos[4] && <CarPhoto className="border-b" carImageUrl={carPhotos[4]} />}
        </div>
        <div className={cn("grid", carPhotos.length > 5 ? "grid-cols-3" : carPhotos.length > 3 ? "grid-cols-2" : "")}>
          {carPhotos[2] && <CarPhoto className="border-r" carImageUrl={carPhotos[2]} />}
          {carPhotos[3] && (
            <CarPhoto className={cn("", carPhotos.length > 5 ? "border-r" : "")} carImageUrl={carPhotos[3]} />
          )}
          {carPhotos[5] && <CarPhoto carImageUrl={carPhotos[5]} />}
        </div>
      </div>
    </div>
  );
}

function CarPhoto({ carImageUrl, className }: { carImageUrl: string; className?: string }) {
  return (
    <Image
      src={carImageUrl}
      alt=""
      width={1000}
      height={1000}
      className={cn("h-full w-full border-white bg-gray-500 object-cover object-center", className)}
    />
  );
}

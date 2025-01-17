import { cn } from "@/utils";
import { getListingStatusTextFromStatus } from "@/model/BaseCarInfo";
import { TFunction } from "@/utils/i18n";

export default function RentalityCarItem({
  carInfo,
  t,
}: {
  carInfo: {
    model: string;
    brand: string;
    image: string;
    dimoTokenId: number;
    carId: number;
    isSynced: boolean;
  };
  t: TFunction;
}) {
  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg md:flex-row">
      <div
        style={{
          backgroundImage: `url(${carInfo.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative min-h-[12rem] w-full flex-shrink-0 md:w-64"
      ></div>

      <div className="flex w-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <strong className="text-xl">{`${carInfo.brand} ${carInfo.model}`}</strong>
          <span
            className={cn(
              "ml-2 rounded-full px-3 py-1 text-sm font-medium",
              carInfo.isSynced ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {carInfo.isSynced ? t("Synced") : t("Not Synced")}
          </span>
        </div>

        <div className="mt-2 text-sm">
          <div>{`${t("DIMO Token ID")}: ${carInfo.dimoTokenId}`}</div>
          <div>{`${t("Car ID")}: ${carInfo.carId}`}</div>
        </div>
      </div>
    </div>
  );
}

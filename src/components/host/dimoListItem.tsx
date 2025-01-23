
import RntButton from "../common/rntButton";
import { TFunction } from "@/utils/i18n";
import { cn } from "@/utils";
import { DimoCarResponse  } from "@/pages/host/dimo";

export default function DimoListingItem({
  carInfo,
  t,
  onCreateRentalityCar, 
}: {
  carInfo: DimoCarResponse;
  t: TFunction;
  onCreateRentalityCar: () => void; 
}) {
  let statusBgColor = carInfo.tokenId ? "bg-lime-500" : "bg-red-500";
  const statusClassName = cn(
    "absolute right-0 top-2 px-8 py-2 rounded-l-3xl text-rnt-temp-status-text text-end",
    statusBgColor
  );

  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg md:flex-row">
  
      <div className="flex w-full flex-col justify-between p-4">
        <div className="flex flex-row items-baseline justify-between">
          <div>
            <strong className="text-xl">{`${carInfo.definition.make} ${carInfo.definition.model} ${carInfo.definition.year}`}</strong>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <div className="flex flex-col">
            <div className="text-sm">{`DIMO Token ID: ${carInfo.tokenId}`}</div>
          </div>
          <RntButton onClick={onCreateRentalityCar}>
            {
              "Create car on Rentality"
            }
          </RntButton>
        </div>
      </div>
    </div>
  );
}

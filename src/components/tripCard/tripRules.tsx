import { memo } from "react";
import { TFunction } from "@/utils/i18n";
import RntTripRulesModal from "../common/rntTripRulesModal";
import RntWalletsModal from "../common/rntWalletsModal";
import { TripInfo } from "@/model/TripInfo";

function TripRules({ tripInfo, t }: { tripInfo: TripInfo; t: TFunction }) {
  return (
    <div className="2xl:w-46 flex flex-col p-4 text-end max-2xl:w-full md:p-2 xl:p-4 2xl:flex-shrink-0">
      <div className="flex max-2xl:justify-between 2xl:flex-col 2xl:gap-2 2xl:pr-8">
        <div className="flex flex-row justify-between gap-x-10 2xl:mt-6">
          <RntTripRulesModal />
        </div>
        <div className="flex flex-row justify-between gap-x-10 2xl:mt-6">
          <RntWalletsModal tripInfo={tripInfo} />
        </div>
      </div>
    </div>
  );
}

export default memo(TripRules);

import { memo } from "react";
import { TFunction } from "@/utils/i18n";
import RntTripRulesModal from "../common/rntTripRulesModal";
import RntWalletsModal from "../common/rntWalletsModal";
import { TripInfo } from "@/model/TripInfo";

function TripRules({ tripInfo, t }: { tripInfo: TripInfo; t: TFunction }) {
  return (
    <div className="flex flex-col">
      <div className="flex max-2xl:justify-between 2xl:flex-col 2xl:gap-2">
        <div className="flex flex-row justify-between gap-x-10">
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

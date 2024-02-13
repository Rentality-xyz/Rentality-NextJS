import { dateFormatDayMonthTime } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import RntButton from "../common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { Dispatch, SetStateAction } from "react";

export default function CurrentStatusInfo({
  tripInfo,
  changeStatusCallback,
  disableButton,
  isAdditionalActionHidden,
  setIsAdditionalActionHidden,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  isAdditionalActionHidden: boolean;
  setIsAdditionalActionHidden: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      id="trip-action-info"
      className="w-full sm_inverted:w-1/4 flex flex-1 flex-col justify-between gap-2 p-4 md:p-2 xl:p-4"
    >
      <div className="flex flex-col">
        <div className="text-center text-[#52D1C9]">
          <strong>Guest booked a trip at {dateFormatDayMonthTime(tripInfo.createdDateTime)}</strong>
        </div>
        <div className="mt-4 text-center">
          {/* `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` */}
          You have 1 hour to confirm this trip or it&apos;ll auto-reject
        </div>
      </div>

      {!isAdditionalActionHidden ? null : (
        <div className="flex max-sm_inverted:flex-row flex-col 2xl:flex-row gap-4">
          {tripInfo.allowedActions.map((action, index) => {
            return index === 0 ? (
              <RntButton
                key={action.text}
                className="h-12 w-full px-4"
                disabled={disableButton}
                onClick={() => {
                  if (action.params == null || action.params.length == 0) {
                    changeStatusCallback(() => {
                      return action.action(BigInt(tripInfo.tripId), []);
                    });
                  } else {
                    setIsAdditionalActionHidden(false);
                  }
                }}
              >
                {action.text}
              </RntButton>
            ) : (
              <RntButtonTransparent
                key={action.text}
                className="h-12 w-full px-4"
                disabled={disableButton}
                onClick={() => {
                  if (action.params == null || action.params.length == 0) {
                    changeStatusCallback(() => {
                      return action.action(BigInt(tripInfo.tripId), []);
                    });
                  } else {
                    setIsAdditionalActionHidden(false);
                  }
                }}
              >
                {action.text}
              </RntButtonTransparent>
            );
          })}
        </div>
      )}
    </div>
  );
}

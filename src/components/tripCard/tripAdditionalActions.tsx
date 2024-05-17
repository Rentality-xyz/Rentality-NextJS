import React, { MutableRefObject, memo, useState } from "react";
import { TripInfo, getRefuelValueAndCharge } from "@/model/TripInfo";
import Checkbox from "../common/checkbox";
import { calculateDays } from "@/utils/date";
import RntSelect from "../common/rntSelect";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import AllowedActionsForStatusStarted from "../guest/allowedActionsForStatusStarted";
import AllowedActions from "../guest/allowedActions";
import { TripStatus } from "@/model/blockchain/schemas";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import AllowedActionsForStatusConfirmed from "../host/allowedActionsForStatusConfirmed";

function TripAdditionalActions({
  tripInfo,
  changeStatusCallback,
  disableButton,
  refForScrool,
  isHost,
  t,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  refForScrool?: MutableRefObject<HTMLDivElement>;
  isHost: boolean;
  t: TFunction;
}) {
  const defaultValues =
    tripInfo?.allowedActions?.length > 0
      ? tripInfo?.allowedActions[0].params.map((i) => {
          return i.value;
        })
      : [];
  const [inputParams, setInputParams] = useState<string[]>(defaultValues);
  const [confirmParams, setConfirmParams] = useState<boolean[]>([]);
  const { showDialog } = useRntDialogs();

  const { refuelValue, refuelCharge } = getRefuelValueAndCharge(tripInfo, tripInfo.endFuelLevelInPercents);
  const tripDays = calculateDays(tripInfo.tripStart, tripInfo.tripEnd);
  var overmileValue = tripInfo.endOdometr - tripInfo.startOdometr - tripInfo.milesIncludedPerDay * tripDays;
  overmileValue = overmileValue > 0 ? overmileValue : 0;

  const handleButtonClick = () => {
    if (tripInfo == null || tripInfo.allowedActions == null || tripInfo.allowedActions.length == 0) {
      return;
    }

    if (
      tripInfo.allowedActions[0].readonly &&
      (confirmParams.length != defaultValues.length || !confirmParams.every((i) => i === true))
    ) {
      showDialog(t("booked.confirm_full"));
      return;
    }

    if (inputParams.length > 0 && !inputParams.every((i) => !isEmpty(i))) {
      showDialog(t("booked.input_full_odom"));
      return;
    }

    changeStatusCallback(() => {
      return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), inputParams);
    });
  };

  if (isHost)
    return (
      <div className="flex flex-col px-8 pt-2 pb-4" ref={refForScrool}>
        <hr />
        <div id="trip-allowed-actions">
          <strong className="text-xl">
            {t("booked.confirm_data_to_change_status", {
              type: tripInfo.allowedActions[0].readonly ? "confirm" : "enter",
            })}
          </strong>
        </div>

        {tripInfo.status === TripStatus.Confirmed ? (
          <AllowedActionsForStatusConfirmed
            params={tripInfo.allowedActions[0].params}
            inputParams={inputParams}
            setInputParams={setInputParams}
          />
        ) : tripInfo.status === TripStatus.Started || tripInfo.status === TripStatus.CheckedInByHost ? (
          <AllowedActionsForStatusStarted
            tripInfo={tripInfo}
            params={tripInfo.allowedActions[0].params}
            inputParams={inputParams}
            setInputParams={setInputParams}
            isFinishingByHost={true}
          />
        ) : (
          <div className="flex flex-col gap-4 py-4">
            {tripInfo.allowedActions[0].params.map((param, index) => {
              return (
                <div className="flex flex-col md:flex-row" key={param.text}>
                  <div className="flex items-end w-full md:w-1/2 xl:w-1/3">
                    {param.type === "fuel" ? (
                      <RntSelect
                        className="w-full"
                        id={param.text}
                        label={param.text}
                        readOnly={tripInfo.allowedActions[0].readonly}
                        value={inputParams[index]}
                        onChange={(e) => {
                          setInputParams((prev) => {
                            const copy = [...prev];
                            copy[index] = e.target.value;
                            return copy;
                          });
                        }}
                      >
                        <option className="hidden" disabled></option>
                        <option value="0">0%</option>
                        <option value="0.1">10%</option>
                        <option value="0.2">20%</option>
                        <option value="0.3">30%</option>
                        <option value="0.4">40%</option>
                        <option value="0.5">50%</option>
                        <option value="0.6">60%</option>
                        <option value="0.7">70%</option>
                        <option value="0.8">80%</option>
                        <option value="0.9">90%</option>
                        <option value="1">100%</option>
                      </RntSelect>
                    ) : (
                      <RntInput
                        className="w-full"
                        id={param.text}
                        label={param.text}
                        readOnly={tripInfo.allowedActions[0].readonly}
                        value={inputParams[index]}
                        onChange={(e) => {
                          setInputParams((prev) => {
                            const copy = [...prev];
                            copy[index] = e.target.value;
                            return copy;
                          });
                        }}
                      />
                    )}

                    {tripInfo.allowedActions[0].readonly ? (
                      <Checkbox
                        className="ml-4"
                        title={t("common.confirm")}
                        value={confirmParams[index]}
                        onChange={(newValue) => {
                          setConfirmParams((prev) => {
                            const copy = [...prev];
                            copy[index] = newValue.target.checked;
                            return copy;
                          });
                        }}
                      />
                    ) : null}
                  </div>

                  {tripInfo.status === TripStatus.CheckedOutByGuest ? (
                    param.type === "fuel" ? (
                      <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                        <span className="font-bold col-span-2">{t("booked.reimbursement")}</span>
                        <span>{t("booked.refuel")}</span>
                        <span>
                          {refuelValue} {t("booked.refuel_measure")}
                        </span>
                        <span>{t("booked.gal_price")}</span>
                        <span>${displayMoneyWith2Digits(tripInfo.fuelPricePerGal)}</span>
                        <span>{t("booked.refuel_or_battery")}</span>
                        <span>${displayMoneyWith2Digits(refuelCharge)}</span>
                      </div>
                    ) : (
                      <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                        <span>{t("booked.overmiles")}</span>
                        <span>{overmileValue}</span>
                        <span>{t("booked.overmile_price")}</span>
                        <span>${tripInfo.overmilePrice.toFixed(4)}</span>
                        <span>{t("booked.overmile_charge")}</span>
                        <span>${displayMoneyWith2Digits(overmileValue * tripInfo.overmilePrice)}</span>
                      </div>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-row gap-4">
          {tripInfo.allowedActions.map((action) => {
            return (
              <RntButton
                key={action.text}
                className="max-md:w-full h-16 px-4"
                disabled={disableButton}
                onClick={() => {
                  if (action.params == null || action.params.length == 0) {
                    changeStatusCallback(() => {
                      return action.action(BigInt(tripInfo.tripId), []);
                    });
                  } else {
                    handleButtonClick();
                  }
                }}
              >
                {action.text}
              </RntButton>
            );
          })}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col px-8 pt-2 pb-4" ref={refForScrool}>
      <hr />
      <div id="trip-allowed-actions">
        <strong className="text-xl">
          {t("booked.confirm_data_to_change_status", {
            type: tripInfo.allowedActions[0].readonly ? "confirm" : "enter",
          })}
        </strong>
      </div>
      {tripInfo.status === TripStatus.Started ? (
        <AllowedActionsForStatusStarted
          tripInfo={tripInfo}
          params={tripInfo.allowedActions[0].params}
          inputParams={inputParams}
          setInputParams={setInputParams}
        />
      ) : (
        <AllowedActions
          tripInfo={tripInfo}
          inputParams={inputParams}
          setInputParams={setInputParams}
          confirmParams={confirmParams}
          setConfirmParams={setConfirmParams}
        />
      )}

      <div className="flex flex-row gap-4">
        {tripInfo.allowedActions.map((action) => {
          return (
            <RntButton
              key={action.text}
              className="max-md:w-full h-16 px-4"
              disabled={disableButton}
              onClick={() => {
                if (action.params == null || action.params.length == 0) {
                  changeStatusCallback(() => {
                    return action.action(BigInt(tripInfo.tripId), []);
                  });
                } else {
                  handleButtonClick();
                }
              }}
            >
              {action.text}
            </RntButton>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TripAdditionalActions);

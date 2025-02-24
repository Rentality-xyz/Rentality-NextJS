import RntCheckbox from "@/components/common/rntCheckbox";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { TripInfo } from "@/model/TripInfo";
import React, { SetStateAction } from "react";

export default function AllowedActionsGuest({
  tripInfo,
  inputParams,
  setInputParams,
  confirmParams,
  setConfirmParams,
}: {
  tripInfo: TripInfo;
  inputParams: string[];
  setInputParams: (value: SetStateAction<string[]>) => void;
  confirmParams: boolean[];
  setConfirmParams: (value: SetStateAction<boolean[]>) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-4 py-4">
      {tripInfo.allowedActions[0].params.map((param, index) => {
        return (
          <div className="flex flex-row items-end" key={param.text}>
            {param.type === "fuel" ? (
              <RntSelect
                className=""
                id={param.text}
                label={param.text}
                readOnly={tripInfo.allowedActions[0].readonly}
                value={inputParams[index]}
                onChange={(e) => {
                  const newValue = e.target.value;

                  setInputParams((prev) => {
                    const copy = [...prev];
                    copy[index] = newValue;
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
                className=""
                id={param.text}
                label={param.text}
                readOnly={tripInfo.allowedActions[0].readonly}
                value={inputParams[index]}
                onChange={(e) => {
                  const newValue = e.target.value;

                  setInputParams((prev) => {
                    const copy = [...prev];
                    copy[index] = newValue;
                    return copy;
                  });
                }}
              />
            )}

            {tripInfo.allowedActions[0].readonly ? (
              <RntCheckbox
                className="ml-4"
                label="Confirm"
                checked={confirmParams[index]}
                onChange={(e) => {
                  setConfirmParams((prev) => {
                    const copy = [...prev];
                    copy[index] = e.target.checked;
                    return copy;
                  });
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

import RntCheckbox, { CheckboxLight } from "@/components/common/rntCheckbox";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { TripInfo } from "@/model/TripInfo";
import React, { SetStateAction } from "react";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import RntFilterSelect from "@/components/common/RntFilterSelect";

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
          <div className="flex items-center" key={param.text}>
            {param.type === "fuel" ? (
              <RntFilterSelect
                isTransparentStyle={true}
                containerClassName="w-full"
                id={param.text}
                label={param.text}
                disabled={tripInfo.allowedActions[0].readonly}
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
                <RntFilterSelect.Option value="0">0%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.1">10%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.2">20%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.3">30%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.4">40%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.5">50%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.6">60%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.7">70%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.8">80%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="0.9">90%</RntFilterSelect.Option>
                <RntFilterSelect.Option value="1">100%</RntFilterSelect.Option>
              </RntFilterSelect>
            ) : (
              <RntInputTransparent
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
              <CheckboxLight
                className="ml-4 mt-7"
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

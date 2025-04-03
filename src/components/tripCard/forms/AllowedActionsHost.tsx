import { CheckboxLight } from "@/components/common/rntCheckbox";
import { TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import React, { SetStateAction } from "react";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { isEmpty } from "@/utils/string";

export default function AllowedActionsHost({
  tripInfo,
  inputParams,
  setInputParams,
  confirmParams,
  setConfirmParams,
  t,
}: {
  tripInfo: TripInfo;
  inputParams: string[];
  setInputParams: (value: SetStateAction<string[]>) => void;
  confirmParams: boolean[];
  setConfirmParams: (value: SetStateAction<boolean[]>) => void;
  t: TFunction;
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
                  if (isEmpty(newValue)) {
                    return;
                  }
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
              <CheckboxLight
                className="ml-4 mt-7"
                label={t("common.confirm")}
                checked={confirmParams[index]}
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
        );
      })}
    </div>
  );
}

import { TripInfo } from "@/model/TripInfo";
import RntInput from "../common/rntInput";
import { SetStateAction } from "react";
import Checkbox from "../common/checkbox";
import RntSelect from "../common/rntSelect";

export default function AllowedActions({
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
    <div className="flex flex-col py-4">
      {tripInfo.allowedActions[0].params.map((param, index) => {
        return (
          <div className="flex flex-row items-end" key={param.text}>
            {param.type === "fuel" ? (
              <RntSelect
                className="w-1/3 py-2"
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
                <option value="0">0</option>
                <option value="0.125">1/8</option>
                <option value="0.25">1/4</option>
                <option value="0.375">3/8</option>
                <option value="0.5">1/2</option>
                <option value="0.625">5/8</option>
                <option value="0.75">3/4</option>
                <option value="0.875">7/8</option>
                <option value="1">full</option>
              </RntSelect>
            ) : (
              <RntInput
                className="w-1/3 py-2"
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
              <Checkbox
                className="ml-4"
                title="Confirm"
                value={confirmParams[index]}
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

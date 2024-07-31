import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { ChangeTripParams } from "@/model/TripInfo";
import { SetStateAction } from "react";

export default function AllowedActionsHostConfirmed({
  params,
  inputParams,
  setInputParams,
}: {
  params: ChangeTripParams[];
  inputParams: string[];
  setInputParams: (value: SetStateAction<string[]>) => void;
}) {
  return (
    <>
      <div className="flex flex-row flex-wrap gap-12 py-4 ">
        <div className="w-full flex flex-col md:flex-1 lg:flex-none lg:w-1/3">
          <RntSelect
            className="py-2"
            id={params[0].text}
            label={params[0].text}
            value={inputParams[0]}
            onChange={(e) => {
              const newValue = e.target.value;

              setInputParams((prev) => {
                const copy = [...prev];
                copy[0] = newValue;
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
          <RntInput
            className="py-2"
            id={params[1].text}
            label={params[1].text}
            value={inputParams[1]}
            onChange={(e) => {
              const newValue = e.target.value;

              setInputParams((prev) => {
                const copy = [...prev];
                copy[1] = newValue;
                return copy;
              });
            }}
          />
        </div>
        <div className="w-full flex flex-col md:flex-1 lg:flex-none lg:w-1/3">
          <RntInput
            className="py-2"
            id={params[2].text}
            label={params[2].text}
            value={inputParams[2]}
            onChange={(e) => {
              const newValue = e.target.value;

              setInputParams((prev) => {
                const copy = [...prev];
                copy[2] = newValue;
                return copy;
              });
            }}
          />
          <RntInput
            className="py-2"
            id={params[3].text}
            label={params[3].text}
            value={inputParams[3]}
            onChange={(e) => {
              const newValue = e.target.value;

              setInputParams((prev) => {
                const copy = [...prev];
                copy[3] = newValue;
                return copy;
              });
            }}
          />
        </div>
      </div>
    </>
  );
}

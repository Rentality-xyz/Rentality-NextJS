import { forwardRef } from "react";
import RntSelect, { RntSelectProps } from "./rntSelect";

interface RntFuelLevelSelectProps extends RntSelectProps {
  onLevelChange: (newLevel: number) => void;
}

const RntFuelLevelSelect = forwardRef<HTMLSelectElement, RntFuelLevelSelectProps>(
  ({ value, onLevelChange, ...rest }, ref) => {
    return (
      <RntSelect
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (Number.isFinite(newValue)) {
            onLevelChange(newValue);
          }
        }}
        {...rest}
        ref={ref}
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
    );
  }
);
RntFuelLevelSelect.displayName = "RntFuelLevelSelect";

export default RntFuelLevelSelect;

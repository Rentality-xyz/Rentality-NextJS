import React, { forwardRef } from "react";
import RntSelect, { RntSelectProps } from "./rntSelect";
import RntFilterSelect from "@/components/common/RntFilterSelect";

interface RntFuelLevelSelectProps extends RntSelectProps {
  onLevelChange: (newLevel: number) => void;
}

const RntFuelLevelSelect = forwardRef<HTMLSelectElement, RntFuelLevelSelectProps>(
  ({ value, onLevelChange, ...rest }, ref) => {
    return (
      <RntFilterSelect
        isTransparentStyle={true}
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (Number.isFinite(newValue)) {
            onLevelChange(newValue);
          }
        }}
        {...rest}
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
    );
  }
);
RntFuelLevelSelect.displayName = "RntFuelLevelSelect";

export default RntFuelLevelSelect;

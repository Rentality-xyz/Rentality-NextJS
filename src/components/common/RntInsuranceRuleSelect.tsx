import { RntSelectProps } from "./rntSelect";
import React, { useMemo } from "react";
import RntFilterSelect from "./RntFilterSelect";
import { InsuranceRule } from "@/hooks/host/useFetchAllInsuranceRules";

interface RntInsuranceRuleSelectProps extends RntSelectProps {
  id: string;
  className?: string;
  selectClassName?: string;
  containerClassName?: string;
  promptText?: string;
  label?: string;
  value: string;
  readOnly?: boolean;
  onRuleSelect?: (partToInsurance: bigint, insuranceId: bigint) => void;
  filter?: (item: InsuranceRule) => boolean;
  allInsuranceRules: InsuranceRule[];
}

export default function RntInsuranceRuleSelect({
  id,
  label,
  className,
  containerClassName,
  promptText = "Please select",
  value,
  readOnly,
  onRuleSelect,
  validationError,
  isTransparentStyle,
  filter,
  allInsuranceRules,
}: RntInsuranceRuleSelectProps) {
  const filteredInsuranceRules = useMemo(() => {
    return filter ? allInsuranceRules.filter(filter) : allInsuranceRules;
  }, [allInsuranceRules, filter]);

  const isReadOnly = readOnly || filteredInsuranceRules.length <= 0;

  return (
    <RntFilterSelect
      id={id}
      className={className}
      isTransparentStyle={isTransparentStyle}
      label={label}
      validationError={validationError}
      containerClassName={containerClassName}
      value={value}
      disabled={isReadOnly}
      placeholder={promptText}
      onChange={(e) => {
        const selectedValue = e.target.value;
        const selected = filteredInsuranceRules.find((c) => c.partToInsurance === BigInt(selectedValue));
        if (selected && onRuleSelect) {
          onRuleSelect(selected.partToInsurance, selected.insuranceId);
        }
      }}
    >
      {filteredInsuranceRules.map((insuranceRule) => (
        <RntFilterSelect.Option key={`insuranceRule-${insuranceRule.insuranceId}`} value={insuranceRule.partToInsurance.toString()} data-id={insuranceRule.insuranceId}>
          {`${insuranceRule.partToInsurance} %`}
        </RntFilterSelect.Option>
      ))}
    </RntFilterSelect>
  );
}

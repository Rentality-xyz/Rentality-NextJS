import RntSelect, { RntSelectProps } from "@/components/common/rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI from "@/hooks/useCarAPI";
import RntFilterSelect from "@/components/common/RntFilterSelect";

interface RntCarYearSelectProps extends RntSelectProps {
  id: string;
  label: string;
  className?: string;
  make_id: string;
  model_id: string;
  value: number;
  readOnly?: boolean;
  onYearSelect?: (newYear: number) => void;
  isTransparentStyle?: boolean;
  promptText?: string;
}

export default function RntCarYearSelect({
  id,
  label,
  className,
  readOnly,
  make_id,
  model_id,
  value,
  onYearSelect,
  isTransparentStyle = false,
  promptText = "Please select",
  validationError,
}: RntCarYearSelectProps) {
  const { getCarYearsByMakeAndModel } = useCarAPI();

  const [yearsList, setYearsList] = useState<string[]>([]);

  useEffect(() => {
    if (make_id === "" && model_id === "") {
      setYearsList([]);
    } else {
      getCarYearsByMakeAndModel(make_id, model_id).then(function (response: string[]) {
        setYearsList(response);
      });
    }
  }, [make_id, model_id]);

  return (
    <RntFilterSelect
      id={id}
      isTransparentStyle={isTransparentStyle}
      className={className}
      label={label}
      value={value}
      validationError={validationError}
      disabled={readOnly || false}
      placeholder={promptText}
      onChange={function (e) {
        const newValue = e.target.value;
        if (onYearSelect) onYearSelect(parseInt(newValue));
      }}
    >
      {yearsList.map((yearsListElement, index) => (
        <RntFilterSelect.Option key={"year-manufacture-" + index} data-id={yearsListElement} value={yearsListElement}>
          {yearsListElement}
        </RntFilterSelect.Option>
      ))}
    </RntFilterSelect>
  );
}

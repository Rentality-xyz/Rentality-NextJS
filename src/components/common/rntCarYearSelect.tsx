import RntSelect, { RntSelectProps } from "@/components/common/rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI from "@/hooks/useCarAPI";

interface RntCarYearSelectProps extends RntSelectProps {
  id: string;
  label: string;
  className?: string;
  make_id: string;
  model_id: string;
  value: number;
  readOnly?: boolean;
  onYearSelect?: (newYear: number) => void;
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
    <RntSelect
      id={id}
      className={className}
      label={label}
      value={value}
      readOnly={readOnly || false}
      onChange={function (e) {
        const newValue = e.target.value;
        if (onYearSelect) onYearSelect(parseInt(newValue));
      }}
    >
      <option value="0">Please select</option>
      {yearsList.map((yearsListElement, index) => (
        <option key={"car-year-" + index} value={yearsListElement}>
          {yearsListElement}
        </option>
      ))}
    </RntSelect>
  );
}

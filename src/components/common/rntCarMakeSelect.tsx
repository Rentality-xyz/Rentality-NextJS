import RntSelect from "./rntSelect";
import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI, { CarMakesListElement } from "@/hooks/useCarAPI";

interface RntCarMakeSelectProps extends RntSelectProps {
  id: string;
  className?: string;
  label: string;
  value: string;
  readOnly?: boolean;
  onMakeSelect?: (newID: string, newMake: string) => void;
}

export default function RntCarMakeSelect({
  id,
  label,
  className,
  value,
  readOnly,
  onMakeSelect,
  validationError,
}: RntCarMakeSelectProps) {
  const { getAllCarMakes } = useCarAPI();

  const [makesList, setMakesList] = useState<CarMakesListElement[]>([]);

  useEffect(() => {
    getAllCarMakes().then(function (response) {
      setMakesList(response);
    });
  }, []);

  return (
    <RntSelect
      id={id}
      className={className}
      label={label}
      labelClassName="pl-4"
      value={value}
      validationError={validationError}
      readOnly={readOnly || false}
      onChange={function (e) {
        const newValue: string = e.target.value;
        const newID: string = e.target.options[e.target.selectedIndex].getAttribute("data-id") || "";
        if (onMakeSelect) onMakeSelect(newID, newValue);
      }}
    >
      <option value="">Please select</option>
      {makesList.map((carMakesListElement, index) => (
        <option key={"car-make-" + index} data-id={carMakesListElement.id} value={carMakesListElement.name}>
          {carMakesListElement.name}
        </option>
      ))}
    </RntSelect>
  );
}

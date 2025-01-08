import RntSelect from "./rntSelect";
import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI, { CarMakesListElement } from "@/hooks/useCarAPI";

interface RntCarMakeSelectProps extends RntSelectProps {
  id: string;
  className?: string;
  selectClassName?: string;
  promptText?: string;
  label: string;
  value: string;
  readOnly?: boolean;
  onMakeSelect?: (newID: string, newMake: string) => void;
}

export default function RntCarMakeSelect({
  id,
  label,
  className,
  selectClassName,
  promptText = "Please select",
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

  const isReadOnly = readOnly || makesList.length <= 0;

  return (
    <RntSelect
      isTransparentStyle={true}
      id={id}
      style={
        isReadOnly
          ? { cursor: "not-allowed", backgroundColor: "transparent", color: "#6B7381" }
          : { backgroundColor: "transparent" }
      }
      className={className}
      selectClassName={selectClassName}
      label={label}
      labelClassName="pl-4"
      value={value}
      validationError={validationError}
      readOnly={isReadOnly}
      onChange={function (e) {
        const newValue: string = e.target.value;
        const newID: string = e.target.options[e.target.selectedIndex].getAttribute("data-id") || "";
        if (onMakeSelect) onMakeSelect(newID, newValue);
      }}
    >
      <option value="" hidden>
        {promptText}
      </option>
      {makesList.map((carMakesListElement, index) => (
        <option key={"car-make-" + index} data-id={carMakesListElement.id} value={carMakesListElement.name}>
          {carMakesListElement.name}
        </option>
      ))}
    </RntSelect>
  );
}

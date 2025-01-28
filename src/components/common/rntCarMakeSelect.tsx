import RntSelect from "./rntSelect";
import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI, { CarMakesListElement } from "@/hooks/useCarAPI";
import RntFilterSelect from "@/components/common/rntFilterSelect";
import RntOption from "@/components/common/rntOption";

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
    <RntFilterSelect
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
      placeholder={promptText}
    >
      {makesList.map((carMakesListElement, index) => (
        <RntOption
          key={"car-make-" + index}
          data-id={carMakesListElement.id}
          value={carMakesListElement.name}
          isSelected={carMakesListElement.name === value}
          onClick={() => {
            if (onMakeSelect) onMakeSelect(carMakesListElement.id, carMakesListElement.name);
          }}
        >
          {carMakesListElement.name}
        </RntOption>
      ))}
    </RntFilterSelect>
  );
}

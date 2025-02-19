import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useMemo, useState } from "react";
import useCarAPI, { CarMakesListElement } from "@/hooks/useCarAPI";
import RntFilterSelect from "./RntFilterSelect";
import { cn } from "@/utils";

interface RntCarMakeSelectProps extends RntSelectProps {
  id: string;
  className?: string;
  selectClassName?: string;
  containerClassName?: string;
  promptText?: string;
  label?: string;
  value: string;
  readOnly?: boolean;
  onMakeSelect?: (newID: string, newMake: string) => void;
  filter?: (item: CarMakesListElement) => boolean;
}

export default function RntCarMakeSelect({
  id,
  label,
  className,
  containerClassName,
  promptText = "Please select",
  value,
  readOnly,
  onMakeSelect,
  validationError,
  isTransparentStyle,
  filter,
}: RntCarMakeSelectProps) {
  const { getAllCarMakes } = useCarAPI();

  const [allMakesList, setAllMakesList] = useState<CarMakesListElement[]>([]);

  useEffect(() => {
    getAllCarMakes().then((data) => {
      setAllMakesList(data);
    });
  }, [getAllCarMakes]);

  const makesList = useMemo(() => {
    return filter ? allMakesList.filter(filter) : allMakesList;
  }, [allMakesList, filter]);

  const isReadOnly = readOnly || makesList.length <= 0;

  return (
    <RntFilterSelect
      id={id}
      className={cn(className, isTransparentStyle && !isReadOnly && "btn_input_border-gradient border-0")}
      label={label}
      validationError={validationError}
      containerClassName={containerClassName}
      value={value}
      disabled={isReadOnly}
      placeholder={promptText}
      onChange={function (e) {
        const newValue: string = e.target.value;
        const newID: string = makesList[e.target.selectedIndex]?.id || "";
        if (onMakeSelect) onMakeSelect(newID, newValue);
      }}
    >
      {makesList.map((carMakesListElement, index) => (
        <RntFilterSelect.Option
          key={"car-make-" + index}
          data-id={carMakesListElement.id}
          value={carMakesListElement.name}
        />
      ))}
    </RntFilterSelect>
  );
}

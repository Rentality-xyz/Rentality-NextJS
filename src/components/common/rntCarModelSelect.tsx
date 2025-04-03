import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useMemo, useState } from "react";
import useCarAPI, { CarModelsListElement } from "@/hooks/useCarAPI";
import RntFilterSelect from "./RntFilterSelect";

interface RntCarModelSelectProps extends RntSelectProps {
  id: string;
  label?: string;
  className?: string;
  selectClassName?: string;
  promptText?: string;
  make_id: string;
  value: string;
  readOnly?: boolean;
  onModelSelect?: (newID: string, newMake: string) => void;
  filter?: (item: CarModelsListElement) => boolean;
}

export default function RntCarModelSelect({
  id,
  label,
  className,
  promptText = "Please select",
  readOnly,
  make_id,
  value,
  onModelSelect,
  validationError,
  isTransparentStyle,
  containerClassName,
  filter,
}: RntCarModelSelectProps) {
  const { getCarModelByMake } = useCarAPI();

  const [allModelsList, setAllModelsList] = useState<CarModelsListElement[]>([]);

  useEffect(() => {
    if (make_id == "") {
      setAllModelsList([]);
    } else {
      getCarModelByMake(make_id).then((data) => {
        setAllModelsList(data);
      });
    }
  }, [make_id, getCarModelByMake]);

  const modelsList = useMemo(() => {
    return filter ? allModelsList.filter(filter) : allModelsList;
  }, [allModelsList, filter]);

  const isReadOnly = readOnly || allModelsList.length <= 0;

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
      onChange={function (e) {
        const newValue: string = e.target.value;
        const newID: string = modelsList[e.target.selectedIndex]?.id || "";
        if (onModelSelect) onModelSelect(newID, newValue);
      }}
    >
      {modelsList.map((carModelsListElement, index) => (
        <RntFilterSelect.Option
          key={"car-make-" + index}
          data-id={carModelsListElement.id}
          value={carModelsListElement.name}
        >
          {carModelsListElement.name}
        </RntFilterSelect.Option>
      ))}
    </RntFilterSelect>
  );
}

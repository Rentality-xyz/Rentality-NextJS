import RntSelect from "./rntSelect";
import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI, { CarModelsListElement } from "@/hooks/useCarAPI";
import RntFilterSelect from "@/components/common/rntFilterSelect";
import RntOption from "@/components/common/rntOption";

interface RntCarModelSelectProps extends RntSelectProps {
  id: string;
  label: string;
  className?: string;
  selectClassName?: string;
  promptText?: string;
  make_id: string;
  value: string;
  readOnly?: boolean;
  onModelSelect?: (newID: string, newMake: string) => void;
}

export default function RntCarModelSelect({
  id,
  label,
  className,
  selectClassName,
  promptText = "Please select",
  readOnly,
  make_id,
  value,
  onModelSelect,
  validationError,
}: RntCarModelSelectProps) {
  const { getCarModelByMake } = useCarAPI();

  const [modelsList, setModelsList] = useState<CarModelsListElement[]>([]);

  useEffect(() => {
    if (make_id == "") {
      setModelsList([]);
    } else {
      getCarModelByMake(make_id).then(function (response) {
        setModelsList(response);
      });
    }
  }, [make_id]);

  const isReadOnly = readOnly || modelsList.length <= 0;

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
      {modelsList.map((carModelsListElement, index) => (
        <RntOption
          key={"car-model-" + index}
          data-id={carModelsListElement.id}
          value={carModelsListElement.name}
          isSelected={carModelsListElement.name === value}
          onClick={() => {
            if (onModelSelect) onModelSelect(carModelsListElement.id, carModelsListElement.name);
          }}
        >
          {carModelsListElement.name}
        </RntOption>
      ))}
    </RntFilterSelect>
  );
}

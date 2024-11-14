import RntSelect from "./rntSelect";
import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI, { CarModelsListElement } from "@/hooks/useCarAPI";

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
        const newValue = e.target.value;
        const newID: string = e.target.options[e.target.selectedIndex].getAttribute("data-id") || "";
        if (onModelSelect) onModelSelect(newID, newValue);
      }}
    >
      <option value="" hidden>
        {promptText}
      </option>
      {modelsList.map((carModelsListElement, index) => (
        <option key={"car-model-" + index} data-id={carModelsListElement.id} value={carModelsListElement.name}>
          {carModelsListElement.name}
        </option>
      ))}
    </RntSelect>
  );
}

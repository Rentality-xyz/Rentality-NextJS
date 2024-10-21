import RntSelect from "./rntSelect";
import { RntSelectProps } from "./rntSelect";
import React, { useEffect, useState } from "react";
import useCarAPI, { CarModelsListElement } from "@/hooks/useCarAPI";

interface RntCarModelSelectProps extends RntSelectProps {
  id: string;
  label: string;
  className?: string;
  make_id: string;
  value: string;
  readOnly?: boolean;
  onModelSelect?: (newID: string, newMake: string) => void;
}

export default function RntCarModelSelect({
  id,
  label,
  className,
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
        const newValue = e.target.value;
        const newID: string = e.target.options[e.target.selectedIndex].getAttribute("data-id") || "";
        if (onModelSelect) onModelSelect(newID, newValue);
      }}
    >
      <option value="">Please select</option>
      {modelsList.map((carModelsListElement, index) => (
        <option key={"car-model-" + index} data-id={carModelsListElement.id} value={carModelsListElement.name}>
          {carModelsListElement.name}
        </option>
      ))}
    </RntSelect>
  );
}

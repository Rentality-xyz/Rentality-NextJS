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
  readOnly? : boolean;
  onModelSelect?: (newMake: string) => void;
}

export default function RntCarModelSelect ({id, label, className, readOnly, make_id, value, onModelSelect} : RntCarModelSelectProps) {
  const {getCarModelByMake} = useCarAPI();

  const [modelsList, setModelsList] = useState<CarModelsListElement[]>([]);

  useEffect(() => {
    if (make_id == "") {
      setModelsList([]);
    } else {
      getCarModelByMake(make_id).then(function (response) {
        setModelsList(response);
      });
    }
  },[make_id]);

  return (
    <RntSelect
      id={id}
      className={className}
      label={label}
      value={value}
      readOnly={readOnly || false}
      onChange={function(e) {
        const newValue = e.target.value;
        if (onModelSelect) onModelSelect(newValue);
      }}
  >
      <option value="">Please select</option>
      {modelsList.map((CarModelsListElement) => (
        <option key={"car-model-" + CarModelsListElement.id} value={CarModelsListElement.name}>
          {CarModelsListElement.name}
        </option>
      ))}

    </RntSelect>
  )
}

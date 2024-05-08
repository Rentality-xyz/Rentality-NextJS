import { EngineType } from "./blockchain/schemas";
import carEngineTypePetrolIcon from "@/images/car_engine_type_petrol.svg";
import electricEngineTypeIcon from "@/images/car_engine_type_electric.svg";

export const ENGINE_TYPE_PETROL_STRING = "Gasoline";
export const ENGINE_TYPE_ELECTRIC_STRING = "Electro";

export enum EngineTypeEnum {
  PETROL = 1,
  ELECTRIC = 2,
}

export function getEngineTypeString(engineType: EngineType): string {
  switch (engineType) {
    case EngineType.PETROL:
      return ENGINE_TYPE_PETROL_STRING;
    case EngineType.ELECTRIC:
      return ENGINE_TYPE_ELECTRIC_STRING;
    default:
      return "";
  }
}

export function getEngineTypeCode(engineTypeString: string): bigint {
  switch (engineTypeString) {
    case ENGINE_TYPE_PETROL_STRING:
      return EngineType.PETROL;
    case ENGINE_TYPE_ELECTRIC_STRING:
      return EngineType.ELECTRIC;
    default:
      return BigInt(0);
  }
}

export const getEngineTypeIcon = (engineType: EngineType): string => {
  switch (engineType) {
    case EngineType.PETROL:
      return carEngineTypePetrolIcon; // Путь к изображению для бензинового двигателя
    case EngineType.ELECTRIC:
      return electricEngineTypeIcon; // Путь к изображению для электрического двигателя
    default:
      return carEngineTypePetrolIcon; // Путь к изображению по умолчанию или пустая строка
  }
};

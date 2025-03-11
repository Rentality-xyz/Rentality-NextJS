import { EngineType } from "./blockchain/schemas";

export const ENGINE_TYPE_PETROL_STRING = "Gasoline";
export const ENGINE_TYPE_ELECTRIC_STRING = "Electro";

export type EngineTypeType = typeof ENGINE_TYPE_PETROL_STRING | typeof ENGINE_TYPE_ELECTRIC_STRING;
export enum EngineTypeEnum {
  PETROL = 1,
  ELECTRIC = 2,
}

export function getEngineTypeString(
  engineType: EngineType
): typeof ENGINE_TYPE_PETROL_STRING | typeof ENGINE_TYPE_ELECTRIC_STRING | undefined {
  switch (engineType) {
    case EngineType.PETROL:
      return ENGINE_TYPE_PETROL_STRING;
    case EngineType.ELECTRIC:
      return ENGINE_TYPE_ELECTRIC_STRING;
    default:
      return undefined;
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
      return "/images/icons/car_info/car_engine_type_petrol.svg"; // Путь к изображению для бензинового двигателя
    case EngineType.ELECTRIC:
      return "/images/icons/car_info/car_engine_type_electric.svg"; // Путь к изображению для электрического двигателя
    default:
      return "/images/icons/car_info/car_engine_type_petrol.svg"; // Путь к изображению по умолчанию или пустая строка
  }
};

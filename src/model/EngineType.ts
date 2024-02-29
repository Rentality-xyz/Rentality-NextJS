export const ENGINE_TYPE_PATROL_STRING = "Gasoline";
export const ENGINE_TYPE_ELECTRIC_STRING = "Electro";

export enum EngineType {
  PATROL = 1,
  ELECTRIC = 2,
}

export function getEngineTypeString(engineType: EngineType): string {
  switch (engineType) {
    case EngineType.PATROL:
      return ENGINE_TYPE_PATROL_STRING;
    case EngineType.ELECTRIC:
      return ENGINE_TYPE_ELECTRIC_STRING;
    default:
      return "";
  }
}

export function getEngineTypeCode(engineTypeString: string): number {
  switch (engineTypeString) {
    case ENGINE_TYPE_PATROL_STRING:
      return 1;
    case ENGINE_TYPE_ELECTRIC_STRING:
      return 2;
    default:
      return 0;
  }
}

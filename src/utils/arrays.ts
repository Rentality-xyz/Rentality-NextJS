export function hasValue<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function onlyUnique<T>(value: T, index: number, array: Array<T>) {
  return array.indexOf(value) === index;
}

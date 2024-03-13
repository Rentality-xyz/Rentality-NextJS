export function hasValue<T>(value: T | undefined): value is T {
  return value !== undefined;
}

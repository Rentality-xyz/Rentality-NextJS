export function flattenErrors(errors: any, path: string[] = [], result: Record<string, string> = {}) {
  for (const key in errors) {
    if (!errors.hasOwnProperty(key)) continue;

    const current = errors[key];
    const currentPath = [...path, key];

    if (current?.message) {
      result[currentPath.join(".")] = current.message;
    } else if (typeof current === "object") {
      flattenErrors(current, currentPath, result);
    }
  }

  return result;
}

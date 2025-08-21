export function formatFloatInput(value: string): string {
  let result = value
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^0+(?=\d)/, "");

  if (result.startsWith(".")) {
    result = "0" + result;
  }

  return result;
}


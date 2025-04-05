export function formatFloatInput(value: string): string {
   let result = value
   /// sub comas for dots
    .replace(/,/g, ".")
    /// remove all non-numeric chars
    .replace(/[^0-9.]/g, "")
    /// remove all dots after the first one
    .replace(/(\..*)\./g, "$1");
    /// remove all leading zeros
  result = value.replace(/^0+(?=\d)/, "");
  return result;

}
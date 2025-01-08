export function nameof<TObject>(obj: TObject, key: Extract<keyof TObject, string>): string;
export function nameof<TObject>(key: Extract<keyof TObject, string>): string;
export function nameof(key1: any, key2?: any): any {
  return key2 ?? key1;
}

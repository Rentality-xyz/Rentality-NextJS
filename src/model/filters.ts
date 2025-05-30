export interface FilterOption<T extends string> {
  key: T;
}

export interface FilterDefinition<T extends string> {
  key: string;
  options: FilterOption<T>[];
}

export interface LocalizedFilterOption<T extends string> extends FilterOption<T> {
  text: string;
}

export interface LocalizedFilter<T extends string> {
  key: string;
  label: string;
  options: LocalizedFilterOption<T>[];
}

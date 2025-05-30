import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { FilterDefinition, LocalizedFilter } from "@/model/filters";

export function useFilters<T extends string>(filterDefinition: FilterDefinition<T>) {
  const { t } = useTranslation();

  const localizedFilter: LocalizedFilter<T> = useMemo(() => {
    return {
      key: filterDefinition.key,
      label: t(`${filterDefinition.key}.label`),
      options: filterDefinition.options.map((option) => ({
        key: option.key,
        text: t(`${filterDefinition.key}.options.${option.key}`),
      })),
    };
  }, [filterDefinition.key, filterDefinition.options, t]);

  return localizedFilter;
}

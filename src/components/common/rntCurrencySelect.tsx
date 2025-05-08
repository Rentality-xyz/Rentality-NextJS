import { RntSelectProps } from "./rntSelect";
import React, { useMemo } from "react";
import RntFilterSelect from "./RntFilterSelect";
import { AvailableCurrency } from "@/hooks/host/useFetchAvailableCurrencies";

interface RntCurrencySelectProps extends RntSelectProps {
  id: string;
  className?: string;
  selectClassName?: string;
  containerClassName?: string;
  promptText?: string;
  label?: string;
  value: string;
  readOnly?: boolean;
  onCurrencySelect?: (currency: string, name: string) => void;
  filter?: (item: AvailableCurrency) => boolean;
  availableCurrency: AvailableCurrency[];
}

export default function RntCurrencySelect({
  id,
  label,
  className,
  containerClassName,
  promptText = "Please select",
  value,
  readOnly,
  onCurrencySelect,
  validationError,
  isTransparentStyle,
  filter,
  availableCurrency,
}: RntCurrencySelectProps) {
  const filteredCurrencies = useMemo(() => {
    return filter ? availableCurrency.filter(filter) : availableCurrency;
  }, [availableCurrency, filter]);

  const isReadOnly = readOnly || filteredCurrencies.length <= 0;

  return (
    <RntFilterSelect
      id={id}
      className={className}
      isTransparentStyle={isTransparentStyle}
      label={label}
      validationError={validationError}
      containerClassName={containerClassName}
      value={value}
      disabled={isReadOnly}
      placeholder={promptText}
      onChange={(e) => {
        const selectedValue = e.target.value;
        const selected = filteredCurrencies.find((c) => c.name === selectedValue);
        if (selected && onCurrencySelect) {
          onCurrencySelect(selected.currency, selected.name);
        }
      }}
    >
      {filteredCurrencies.map((currency) => (
        <RntFilterSelect.Option key={`currency-${currency.currency}`} value={currency.name} data-id={currency.currency}>
          {currency.name}
        </RntFilterSelect.Option>
      ))}
    </RntFilterSelect>
  );
}

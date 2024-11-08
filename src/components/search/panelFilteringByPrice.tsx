import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import arrowUpTurquoise from "@/images/arrowUpTurquoise.svg";
import arrowDownTurquoise from "@/images/arrowDownTurquoise.svg";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { useTranslation } from "react-i18next";
import { IPanelFilterProps } from "@/components/search/panelFilterProps";
import Slider from "@mui/material/Slider";
import RntButton from "@/components/common/rntButton";

export default function PanelFilteringByPrice({
  id,
  onClickReset,
  onClickApply,
  isResetFilters,
  maxValue,
}: IPanelFilterProps) {
  const minPrice = 0;
  const maxPrice = maxValue ?? 2000;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState([minPrice, maxPrice]);
  const [selectedValue, setSelectedValue] = useState(value);

  const toggleDropdown = () => {
    setIsOpen((prevIsOpen) => {
      if (prevIsOpen) {
        // Логика для случая, когда dropdown был открыт и сейчас будет закрыт
        setValue(selectedValue);
      }
      return !prevIsOpen;
    });
  };

  const { t } = useTranslation();

  const t_comp = (element: string) => {
    return t("search_and_filters." + element);
  };

  const handleSliderChange = (event: any, newValue: number | number[]) => {
    setValue(newValue as number[]);
  };

  const handleReset = () => {
    setValue([minPrice, maxPrice]);
    setSelectedValue([minPrice, maxPrice]);
    setIsOpen(false);
    onClickReset();
  };

  const handleApply = () => {
    setSelectedValue(value);
    setIsOpen(false);
    onClickApply(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isResetFilters) {
      setSelectedValue([minPrice, maxPrice]);
      setValue([minPrice, maxPrice]);
    }
  }, [isResetFilters]);

  useEffect(() => {
    if (!isOpen) {
      setValue(selectedValue);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} id={id} className="relative w-full sm:w-48">
      <RntButtonTransparent
        className="w-full"
        onClick={() => {
          toggleDropdown();
        }}
      >
        <div className="relative flex items-center justify-center text-rentality-secondary">
          <div className="text-lg">
            {value[0] === minPrice && value[1] === maxPrice
              ? t_comp("select_filter_price")
              : `${value[0]} - ${value[1]}`}
          </div>
          <Image src={isOpen ? arrowUpTurquoise : arrowDownTurquoise} alt="" className="absolute right-4" />
        </div>
      </RntButtonTransparent>

      {isOpen && (
        <div className="absolute z-10 w-full rounded-lg border border-gray-500 bg-rentality-bg-left-sidebar px-4 py-2 shadow-md sm:left-[-17px] sm:w-56">
          <div className="mb-4 text-lg text-white">
            ${value[0]} - ${value[1]}/day
          </div>

          <div className="mb-4 flex items-center justify-center">
            <Slider
              value={value}
              min={minPrice}
              max={maxPrice}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              className="w-full text-rentality-secondary-shade"
            />
          </div>

          <div className="flex justify-between">
            <RntButton
              className="w-20 border border-gray-300 bg-transparent text-gray-300 hover:border-white hover:text-white"
              minHeight="38px"
              onClick={handleReset}
            >
              {t_comp("button_reset")}
            </RntButton>
            <RntButton className="w-20" minHeight="38px" onClick={handleApply}>
              {t_comp("button_apply")}
            </RntButton>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { useTranslation } from "react-i18next";
import { IPanelFilterProps } from "@/components/search/panelFilterProps";
import Slider from "@mui/material/Slider";
import RntButton from "@/components/common/rntButton";
import { DEFAULT_MAX_FILTER_PRICE } from "@/utils/constants";
import { createPortal } from "react-dom";

export default function PanelFilteringByPrice({
  id,
  onClickReset,
  onClickApply,
  isResetFilters,
  maxValue,
  scrollInfo,
}: IPanelFilterProps) {
  const minPrice = 0;
  const maxPrice = maxValue !== undefined && Number.isFinite(maxValue) ? maxValue : DEFAULT_MAX_FILTER_PRICE;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState([minPrice, maxPrice]);
  const [selectedValue, setSelectedValue] = useState(value);
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [positionDropdown, setPositionDropdown] = useState({ top: 0, left: 0 });

  const toggleDropdown = () => {
    setIsOpen((prevIsOpen) => {
      if (prevIsOpen) {
        // Логика для случая, когда dropdown был открыт и сейчас будет закрыт
        setValue(selectedValue);
      }
      return !prevIsOpen;
    });
  };

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

  useEffect(() => {
    if (!maxValue || !Number.isFinite(maxValue)) return;
    const maxPrice = maxValue !== undefined && Number.isFinite(maxValue) ? maxValue : DEFAULT_MAX_FILTER_PRICE;

    setValue((prev) => {
      return prev[1] <= maxPrice ? prev : [prev[0], maxPrice];
    });
    setSelectedValue((prev) => {
      return prev[1] <= maxPrice ? prev : [prev[0], maxPrice];
    });
  }, [maxValue]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPositionDropdown({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollInfo !== null) {
      setIsOpen(false);
    }
  }, [scrollInfo]);

  return (
    <div ref={buttonRef} id={id} className="relative">
      <RntButtonTransparent
        className="w-48"
        onClick={() => {
          toggleDropdown();
        }}
        isVisibleCircle={false}
      >
        <div ref={dropdownRef} className="relative flex w-full items-center justify-center text-white">
          <div className="text-lg">
            {value[0] <= minPrice && value[1] >= maxPrice
              ? t_comp("select_filter_price")
              : `$${value[0]} - $${value[1]}`}
          </div>
          <Image
            src="/images/icons/arrowTriangleDownGradient.svg"
            alt=""
            width="12"
            height="9"
            className={`ml-4 transition ${isOpen ? "rotate-180" : "rotate-0"} `}
          />
        </div>
      </RntButtonTransparent>

      {isOpen &&
        createPortal(
          <div
            className="absolute z-10 w-64 rounded-lg border border-gray-500 bg-rentality-bg-left-sidebar px-2 py-2 shadow-md"
            style={{
              top: `${positionDropdown.top}px`,
              left: `${positionDropdown.left - 32}px`,
            }}
          >
            <div className="mb-4 text-lg text-white">
              ${value[0]} - ${value[1]}
              {t("common.per_day")}
            </div>

            <div className="mb-4 flex items-center justify-center px-2.5" onClick={(event) => event.stopPropagation()}>
              <Slider
                style={{
                  color: `#26B4B1`,
                }}
                value={value}
                min={minPrice}
                max={maxPrice}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                className="w-full"
              />
            </div>

            <div className="flex justify-between">
              <RntButtonTransparent className="w-28" onClick={handleReset}>
                {t_comp("button_reset")}
              </RntButtonTransparent>
              <RntButton className="w-28" onClick={handleApply}>
                {t_comp("button_apply")}
              </RntButton>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

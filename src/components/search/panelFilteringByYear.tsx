import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { useTranslation } from "react-i18next";
import { IPanelFilterProps } from "@/components/search/panelFilterProps";
import Slider from "@mui/material/Slider";
import RntButton from "@/components/common/rntButton";
import { DEFAULT_MIN_FILTER_YEAR } from "@/utils/constants";
import { createPortal } from "react-dom";

export default function PanelFilteringByYear({
  id,
  onClickReset,
  onClickApply,
  isResetFilters,
  minValue,
  scrollInfo,
}: IPanelFilterProps) {
  const minYear = minValue !== undefined && Number.isFinite(minValue) ? minValue : DEFAULT_MIN_FILTER_YEAR;
  const maxYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState([minYear, maxYear]);
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
    setValue([minYear, maxYear]);
    setSelectedValue([minYear, maxYear]);
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
      setSelectedValue([minYear, maxYear]);
      setValue([minYear, maxYear]);
    }
  }, [isResetFilters]);

  useEffect(() => {
    if (!isOpen) {
      setValue(selectedValue);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!minValue || !Number.isFinite(minValue)) return;
    const minYear = minValue !== undefined && Number.isFinite(minValue) ? minValue : DEFAULT_MIN_FILTER_YEAR;

    setValue((prev) => {
      return prev[0] >= minYear ? prev : [minYear, prev[1]];
    });
    setSelectedValue((prev) => {
      return prev[0] >= minYear ? prev : [minYear, prev[1]];
    });
  }, [minValue]);

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
      <RntButtonTransparent className="w-48" onClick={toggleDropdown} isVisibleCircle={false}>
        <div ref={dropdownRef} className="relative flex w-full items-center justify-center text-white">
          <div className="text-lg">
            {value[0] <= minYear && value[1] >= maxYear ? t_comp("select_filter_years") : `${value[0]} - ${value[1]}`}
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
              {value[0]} - {value[1]}
            </div>

            <div className="mb-4 flex items-center justify-center px-2.5" onClick={(event) => event.stopPropagation()}>
              <Slider
                style={{
                  color: `#26B4B1`,
                }}
                value={value}
                min={minYear}
                max={maxYear}
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

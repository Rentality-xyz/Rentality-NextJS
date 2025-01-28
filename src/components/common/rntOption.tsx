import * as React from "react";
import Image, { StaticImageData } from "next/image";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import { isEmpty } from "@/utils/string";
import arrowDown from "@/images/arrows/arrowDownDisabled.svg";
import { createPortal } from "react-dom";
import RntValidationError from "@/components/common/RntValidationError";

export interface RntOptionProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
  value?: string;
  key?: string;
  isSelected: boolean;
}

const RntOption = forwardRef<HTMLButtonElement, RntOptionProps>(
  ({ className, value, key, isSelected = false, ...rest }, ref) => {

    return (
      <button className={cn(className, "flex transition-colors hover:bg-rentality-additional-light active:bg-rentality-additional-light px-4 w-full")} ref={ref} {...rest}>
        <div className={"flex flex-row gap-2 items-center"}>
          <div className={"flex justify-center items-center"}>
            <input type="radio" checked={isSelected} className={"cursor-pointer bg-transparent appearance-none border-2 border-rentality-additional-tint rounded-full w-4 h-4"}/>
            {isSelected && (<div className={"w-2 h-2 bg-rentality-additional-tint rounded-full absolute"}/>)}
          </div>
          {value}
        </div>
      </button>
    );
  }
);
RntOption.displayName = "RntOption";

export default RntOption;

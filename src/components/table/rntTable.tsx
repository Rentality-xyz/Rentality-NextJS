import * as React from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/utils";

const RntTable = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="custom-scroll w-full overflow-x-auto">
      <table ref={ref} className={cn("w-full table-auto border-spacing-2 text-sm", className)} {...props} />
    </div>
  )
);
RntTable.displayName = "RntTable";

const RntTableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("", className)} {...props} />
);
RntTableHeader.displayName = "RntTableHeader";

const RntTableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("", className)} {...props} />
);
RntTableBody.displayName = "RntTableBody";

const RntTableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tfoot ref={ref} className={cn("", className)} {...props} />
);
RntTableFooter.displayName = "RntTableFooter";

const RntTableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b-[2px] border-b-gray-500", className)} {...props} />
  )
);
RntTableRow.displayName = "RntTableRow";

const RntTableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("px-2 text-center align-middle", className)} {...props} />
  )
);
RntTableHead.displayName = "RntTableHead";

const RntTableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-2 text-center align-middle", className)} {...props} />
  )
);
RntTableCell.displayName = "RntTableCell";

const RntTableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} className={cn("mb-4 text-lg", className)} {...props} />
);
RntTableCaption.displayName = "RntTableCaption";

const RntTableHeaderSorting = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-9 cursor-pointer items-center justify-center rounded-md p-5 hover:bg-gray-700", className)}
      {...props}
    >
      {children}
      <Image src="/images/icons/ic_sorting.svg" width="24" height="24" alt="" className="ml-1" />
    </div>
  )
);
RntTableHeaderSorting.displayName = "RntTableHeaderSorting";

export {
  RntTable,
  RntTableHeader,
  RntTableBody,
  RntTableFooter,
  RntTableHead,
  RntTableRow,
  RntTableCell,
  RntTableCaption,
  RntTableHeaderSorting,
};

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel<T extends object>(
  data: T[],
  columns: { id?: string; accessorKey?: string; accessorFn?: (row: T, index: number) => any }[],
  fileName: string
) {
  const excelData = data.map((row) => {
    const rowData: Record<string, any> = {};

    columns.forEach((col) => {
      const key = col.id ?? col.accessorKey;
      const accessorFn = col.accessorFn;

      if (!key) return;

      rowData[key] = typeof accessorFn === "function" ? accessorFn(row, 0) : row[key as keyof T];
    });

    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
}

import { ReactNode } from "react";

export type DialogState = {
  isOpen: boolean;
  customForm: ReactNode;
  message: string;
  action: ReactNode;
};

export const defaultDialogState: DialogState = {
  isOpen: false,
  customForm: null,
  message: "",
  action: null,
};

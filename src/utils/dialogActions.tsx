import RntButton from "@/components/common/rntButton";
import { MouseEventHandler } from "react";

export const DialogActions = {
  OK: (onClick: MouseEventHandler<HTMLButtonElement>) => {
    return (
      <>
        <RntButton className="mx-4 w-28" onClick={onClick}>
          Ок
        </RntButton>
      </>
    );
  },
  Cancel: (onClick: MouseEventHandler<HTMLButtonElement>) => {
    return (
      <>
        <RntButton className="mx-4 w-32" onClick={onClick}>
          Cancel
        </RntButton>
      </>
    );
  },
  Button: (title: string, onClick: MouseEventHandler<HTMLButtonElement>) => {
    return (
      <>
        <RntButton className="mx-4 w-32" onClick={onClick}>
          {title}
        </RntButton>
      </>
    );
  },
};

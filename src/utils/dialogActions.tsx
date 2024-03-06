import RntButton from "@/components/common/rntButton";
import { MouseEventHandler } from "react";

export const DialogActions = {
  OK: (onClick: MouseEventHandler<HTMLButtonElement>) => {
    return (
      <>
        <RntButton className="w-28 mx-4" onClick={onClick}>
          Ок
        </RntButton>
      </>
    );
  },
  Cancel: (onClick: MouseEventHandler<HTMLButtonElement>) => {
    return (
      <>
        <RntButton className="w-28 mx-4" onClick={onClick}>
          Cancel
        </RntButton>
      </>
    );
  },
  Button: (title: string, onClick: MouseEventHandler<HTMLButtonElement>) => {
    return (
      <>
        <RntButton className="w-28 mx-4" onClick={onClick}>
          {title}
        </RntButton>
      </>
    );
  },
};

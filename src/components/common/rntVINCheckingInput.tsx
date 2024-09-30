import RntInput from "@/components/common/rntInput";
import { useMemo } from "react";
import useCarAPI from "@/hooks/useCarAPI";
import RntButton from "@/components/common/rntButton";
import * as React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type RntVINCheckingInputProps = {
  id: string;
  className?: string;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  isVINVerified: boolean;
  isVINCheckOverriden: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onVINVerified: (isVerified: boolean) => void;
  onVINCheckOverriden: (isVINCheckOverriden: boolean) => void;
};
export default function RntVINCheckingInput({
  id,
  className,
  label,
  placeholder,
  readOnly,
  value,
  isVINVerified,
  onChange,
  onVINVerified,
  onVINCheckOverriden,
  isVINCheckOverriden,
}: RntVINCheckingInputProps) {
  const { checkVINNumber } = useCarAPI();
  const [isVINConfirmDialogOpen, setIsVINConfirmDialogOpen] = React.useState(false);

  const validationError = useMemo(() => {
    if (value.length != 17) {
      return "VIN should be 17 digits";
    } else {
      return !isVINVerified && !isVINCheckOverriden ? "VIN is not verified" : "";
    }
  }, [value, isVINVerified, isVINCheckOverriden]);

  return (
    <>
      <Dialog
        open={isVINConfirmDialogOpen}
        onClose={() => {
          setIsVINConfirmDialogOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#240F50",
          }}
        >
          <div className="text-[#52D1C9]">Vehicle not identified</div>
        </DialogTitle>
        <DialogContent
          sx={{
            background: "#240F50",
          }}
        >
          <DialogContentText
            sx={{
              color: "#fff",
            }}
            id="alert-dialog-description"
          >
            We could not identify your vehicle based on your VIN. Confirm that this VIN {value} is correct or edit it
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#240F50",
            justifyContent: "center",
          }}
        >
          <RntButton onClick={() => setIsVINConfirmDialogOpen(false)} autoFocus>
            Edit
          </RntButton>
          <RntButton
            onClick={() => {
              onVINCheckOverriden(true);
              setIsVINConfirmDialogOpen(false);
            }}
          >
            Confirm
          </RntButton>
        </DialogActions>
      </Dialog>
      <RntInput
        id={id}
        label={label}
        labelClassName = "pl-4"
        placeholder={placeholder}
        className={className}
        readOnly={readOnly}
        value={value}
        validationError={validationError}
        validationClassName="pl-4"
        onChange={(e) => {
          const vinNumber = e.target.value;
          if (vinNumber.length === 17) {
            checkVINNumber(vinNumber).then((result) => {
              onVINVerified(result);
            });
          } else {
            onVINVerified(false);
          }
          onVINCheckOverriden(false);
          onChange != null && onChange(e);
        }}
      />
      {value.length === 17 && !isVINVerified && (
        <div className="flex flex-col">
          <label className="mb-1">&nbsp;</label>
          <RntButton type="button" className="w-[100px]" onClick={() => setIsVINConfirmDialogOpen(true)}>
            Confirm
          </RntButton>
        </div>
      )}
    </>
  );
}

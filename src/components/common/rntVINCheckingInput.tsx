import RntInput from "@/components/common/rntInput";
import { useState, useMemo } from "react";
import useCarAPI from "@/hooks/useCarAPI";
import RntButton from "@/components/common/rntButton";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { t } from "i18next";
import { vinNumberSchema } from "../host/carEditForm/carEditFormSchema";

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

const MAX_VIN_LENGTH: number = 17;

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
  const [isVINConfirmDialogOpen, setIsVINConfirmDialogOpen] = useState(false);

  const validationError = useMemo<string>(() => {
    if (readOnly) return "";
    return value.length != MAX_VIN_LENGTH ? `VIN should be ${MAX_VIN_LENGTH} digits` : "";
  }, [value, readOnly]);

  const validationMessage = useMemo<string>(() => {
    if (!validationError && !isVINVerified) {
      return isVINCheckOverriden ? t("common.vin_not_found_overriden") : t("common.vin_not_found");
    } else {
      return "";
    }
  }, [isVINVerified, validationError, isVINCheckOverriden]);

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
          <div className="text-rentality-secondary">{t("common.vin_not_found_dialog_heading")}</div>
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
            {t("common.vin_not_found_dialog_description1") + value + t("common.vin_not_found_dialog_description2")}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#240F50",
            justifyContent: "center",
          }}
        >
          <RntButton
            onClick={() => {
              onVINCheckOverriden(true);
              setIsVINConfirmDialogOpen(false);
            }}
          >
            Confirm
          </RntButton>
          <RntButton onClick={() => setIsVINConfirmDialogOpen(false)} autoFocus>
            Edit
          </RntButton>
        </DialogActions>
      </Dialog>
      <RntInput
        id={id}
        label={label}
        labelClassName="pl-4"
        placeholder={placeholder}
        className={className}
        readOnly={readOnly}
        value={value}
        validationError={validationError}
        validationClassName="pl-4"
        validationSuccessMessage={isVINVerified ? t("common.vin_successfully_checked") : ""}
        validationMessage={validationMessage}
        onChange={(e) => {
          const vinNumber = e.target.value.toUpperCase();
          const parseResult = vinNumberSchema.safeParse(vinNumber);
          if (!parseResult.success && parseResult.error.issues.every((i) => i.code !== "too_small")) {
            return;
          }
          if (vinNumber.length === MAX_VIN_LENGTH) {
            checkVINNumber(vinNumber).then((result) => {
              onVINVerified(result);
            });
          } else {
            onVINVerified(false);
          }
          onVINCheckOverriden(false);
          onChange != null && onChange(e);
        }}
        onKeyDown={(event) => {
          const target = event.target as HTMLInputElement;

          if (target.value.length !== MAX_VIN_LENGTH) {
            return;
          }

          if (event.key === "Enter" && !isVINVerified && !isVINCheckOverriden) {
            setIsVINConfirmDialogOpen(true);
            return;
          }

          if (event.key !== "Backspace" && event.key !== "Delete") {
            event.preventDefault();
          }
        }}
        onBlur={() => {
          if (value.length === MAX_VIN_LENGTH && !isVINVerified && !isVINCheckOverriden) {
            setIsVINConfirmDialogOpen(true);
          }
        }}
      />
    </>
  );
}

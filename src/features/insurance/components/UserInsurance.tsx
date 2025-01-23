import { Controller, useForm } from "react-hook-form";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { UserInsurancePhoto } from "./UserInsurancePhoto";
import useGuestInsurance from "@/hooks/guest/useGuestInsurance";
import { PlatformFile } from "@/model/FileToUpload";
import { DialogActions } from "@/utils/dialogActions";
import { userInsuranceFormSchema, UserInsuranceFormValues } from "@/features/insurance/models/userInsuranceFormSchema";
import Loading from "@/components/common/Loading";
import RntValidationError from "@/components/common/RntValidationError";
import RntButton from "@/components/common/rntButton";
import DotStatus from "@/components/profileInfo/dotStatus";

function UserInsurance() {
  const { isLoading, guestInsurance, saveGuestInsurance } = useGuestInsurance();
  const { showDialog, hideDialogs } = useRntDialogs();
  const { showInfo, showError, hideSnackbars } = useRntSnackbars();
  const { handleSubmit, formState, control, setValue, watch } = useForm<UserInsuranceFormValues>({
    defaultValues: {},
    resolver: zodResolver(userInsuranceFormSchema),
  });
  const { errors, isSubmitting } = formState;
  const { t } = useTranslation();

  const userInsurancePhoto = watch("userInsurancePhoto");

  async function onFormSubmit(formData: UserInsuranceFormValues) {
    if (!("file" in formData.userInsurancePhoto) && !formData.userInsurancePhoto.isDeleted) return;

    if ("isDeleted" in formData.userInsurancePhoto && formData.userInsurancePhoto.isDeleted) {
      const action = (
        <>
          {DialogActions.Button(t("common.confirm"), async () => {
            await saveInsurance(formData.userInsurancePhoto);
            hideDialogs();
          })}
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog(t("profile.user_insurance.confirm_deletion"), action);
      return;
    }

    await saveInsurance(formData.userInsurancePhoto);
  }

  async function handlePhotoDelete() {
    const action = (
      <>
        {DialogActions.Button(t("common.confirm"), async (e) => {
          if ("disabled" in e.target) {
            e.target.disabled = true;
          }
          await saveInsurance({ url: "", isDeleted: true });
          hideDialogs();
          if ("disabled" in e.target) {
            e.target.disabled = false;
          }
        })}
        {DialogActions.Cancel(hideDialogs)}
      </>
    );
    showDialog(t("profile.user_insurance.confirm_deletion"), action);
  }

  async function saveInsurance(insurancePhoto: PlatformFile) {
    showInfo(t("common.info.sign"));
    const result = await saveGuestInsurance(insurancePhoto);
    hideSnackbars();

    if (!result.ok) {
      console.error("saveInsurance error: Save Guest Insurance info error");
      showError(t("profile.save_err"));
    } else {
      showInfo(t("common.info.success"));
    }
  }

  function handleInfoClick() {
    showDialog(t("profile.user_insurance.insurance_info"));
  }

  useEffect(() => {
    setValue("userInsurancePhoto", { url: guestInsurance.photo });
  }, [guestInsurance.photo, setValue]);

  if (isLoading) return <Loading />;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <strong>General Insurance ID</strong>

      <div className="ml-2 flex flex-row items-center gap-2 text-rentality-secondary-shade" onClick={handleInfoClick}>
        <i className="fi fi-rs-info"></i>
        <span className="mb-1">{t("profile.user_insurance.insurance_requirements")}</span>
      </div>

      <Controller
        name="userInsurancePhoto"
        control={control}
        render={({ field }) => (
          <>
            <UserInsurancePhoto
              insurancePhoto={field.value}
              onInsurancePhotoChanged={(newValue) => {
                field.onChange(newValue);
              }}
              onDelete={handlePhotoDelete}
            />
            <RntValidationError validationError={errors.userInsurancePhoto?.message?.toString()} />
          </>
        )}
      />

      <div className="flex items-center gap-2 md:gap-6">
        <RntButton type="submit" disabled={isSubmitting}>
          {t("common.save")}
        </RntButton>

        {"url" in userInsurancePhoto && !isEmpty(userInsurancePhoto.url) ? (
          <DotStatus color="success" text={t("profile.user_insurance.insurance_uploaded")} />
        ) : (
          <DotStatus color="error" text={t("profile.user_insurance.insurance_not_uploaded")} />
        )}
      </div>
    </form>
  );
}

export default UserInsurance;

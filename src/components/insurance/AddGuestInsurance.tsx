import { useState } from "react";
import { useTranslation } from "react-i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import RntSelect from "../common/rntSelect";
import { UserInsurancePhoto } from "../guest/UserInsurancePhoto";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";

export default function AddGuestInsurance() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  if (isOpen) return <RntButtonTransparent>{t("insurance.add_insurance")}</RntButtonTransparent>;
  return (
    <div className="flex flex-col gap-2">
      <RntButtonTransparent disabled={true}>{t("insurance.add_insurance")}</RntButtonTransparent>
      <hr />
      <div className="hidden w-1/2 flex-col gap-2">
        <div className="flex w-1/2 flex-col gap-2">
          <div className="flex flex-col">
            <h3>Insurance type</h3>
            <p>General Insurance ID</p>
            <p> One-Time trip insurance</p>
          </div>
          <RntSelect label="Trip:"></RntSelect>
        </div>
        <p>Upload up to 5 photos insurance policy</p>

        {/* <Controller
        name="userInsurancePhoto"
        control={control}
        render={({ field }) => (*/}
        <>
          <UserInsurancePhoto
            insurancePhoto={undefined} //{field.value}
            onInsurancePhotoChanged={(newValue) => {
              // field.onChange(newValue);
            }}
          />
          {/* <RntValidationError validationError={errors.userInsurancePhoto?.message?.toString()} /> */}
        </>
        {/* )}
      /> */}

        <div className="flex gap-4">
          <RntInput label="Insurance company name" />
          <RntInput label="Insurance policy number" />
        </div>
        <RntInput label="Comment" />
        <RntButton>Save</RntButton>
      </div>
      <hr className="hidden" />
    </div>
  );
}

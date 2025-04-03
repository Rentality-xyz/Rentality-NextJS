import { FormEvent, useState } from "react";
import RntButton from "../common/rntButton";
import RntInputMultiline from "../common/rntInputMultiline";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { Result } from "@/model/utils/result";
import { useTranslation } from "react-i18next";

function UserErrorDescription({
  onSubmit,
  onCancel,
}: {
  onSubmit: (userDecription: string) => Promise<Result<boolean, Error>>;
  onCancel: () => void;
}) {
  const [userErrorDescription, setUserErrorDescription] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { showError, showSuccess } = useRntSnackbars();
  const { t } = useTranslation();

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const result = await onSubmit(userErrorDescription);

    if (result.ok) {
      setUserErrorDescription("");
      showSuccess(t("common.info.user_error_submit_success"));
      onCancel();
    } else {
      showError(result.error.message);
      setIsPending(false);
    }
  }

  return (
    <form className="flex w-[30rem] flex-col items-center justify-center gap-4" onSubmit={submitForm}>
      <h1 className="text-2xl font-bold">{t("common.info.describe_what_happens")}</h1>
      <RntInputMultiline
        placeholder={t("common.info.share_details_how_reproduce")}
        value={userErrorDescription}
        rows={10}
        disabled={isPending}
        onChange={(e) => setUserErrorDescription(e.target.value)}
      />
      <div className="flex w-full flex-row gap-4">
        <RntButton className="flex-1" onClick={onCancel}>
          {t("common.cancel")}
        </RntButton>
        <RntButton type="submit" className="flex-1" disabled={isPending}>
          {t("common.submit")}
        </RntButton>
      </div>
    </form>
  );
}

export default UserErrorDescription;

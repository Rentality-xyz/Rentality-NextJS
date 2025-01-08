import RntButton from "../../../components/common/rntButton";
import { TFunction } from "@/utils/i18n";
import { useForm } from "react-hook-form";
import { sendMessageFormSchema, SendMessageFormValues } from "./sendMessageFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import RntInputMultiline from "../../../components/common/rntInputMultiline";

export default function SendMessage({
  sendMessageCallback,
  t,
}: {
  sendMessageCallback: (message: string) => Promise<void>;
  t: TFunction;
}) {
  const { register, handleSubmit, formState, reset } = useForm<SendMessageFormValues>({
    defaultValues: { messageText: "" },
    resolver: zodResolver(sendMessageFormSchema),
  });
  const { errors, isSubmitting } = formState;

  async function onFormSubmit(formData: SendMessageFormValues) {
    await sendMessageCallback(formData.messageText);
    reset();
  }

  return (
    <form className="mb-12 flex flex-col gap-4" onSubmit={handleSubmit(async (data) => await onFormSubmit(data))}>
      <div className="text-2xl">{t("send")}</div>
      <RntInputMultiline
        className="text-lg"
        rows={5}
        id="message"
        placeholder={t("enter_message")}
        {...register("messageText")}
        validationError={errors.messageText?.message}
      />
      <RntButton type="submit" disabled={isSubmitting}>
        {t("send")}
      </RntButton>
    </form>
  );
}

import { useState } from "react";
import RntButton from "../common/rntButton";
import { TFunction } from "@/utils/i18n";

export default function SendMessage({
  sendMessageCallback,
  t,
}: {
  sendMessageCallback: (message: string) => Promise<void>;
  t: TFunction;
}) {
  const [newMessage, setNewMessage] = useState<string>("");

  return (
    <section className="mb-12">
      <div className="text-2xl">{t("send")}</div>
      <textarea
        className="text-black w-full px-4 py-2 border-2 rounded-2xl my-2 text-lg"
        rows={5}
        id="message"
        placeholder={t("enter_message")}
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
        }}
      />
      <RntButton
        onClick={async () => {
          await sendMessageCallback(newMessage);
          setNewMessage("");
        }}
      >
        {t("send")}
      </RntButton>
    </section>
  );
}

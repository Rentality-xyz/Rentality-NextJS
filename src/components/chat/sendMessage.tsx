import { useState } from "react";
import RntButton from "../common/rntButton";

type Props = {
  sendMessageCallback: (message: string) => Promise<void>;
};

export default function SendMessage({ sendMessageCallback }: Props) {
  const [newMessage, setNewMessage] = useState<string>("");

  return (
    <section className="mb-12">
      <div className="text-2xl">Send a message</div>
      <textarea
        className="text-black w-full px-4 py-2 border-2 rounded-2xl my-2 text-lg"
        rows={5}
        id="message"
        placeholder="Enter your message"
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
        Send a message
      </RntButton>
    </section>
  );
}

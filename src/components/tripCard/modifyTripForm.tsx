import { memo, useState } from "react";
import { TFunction } from "i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import RntButton from "../common/rntButton";
import RntInputMultiline from "../common/rntInputMultiline";

function ModifyTripForm({
  guestPhoneNumber,
  handleFinishTrip,
  handleCancel,
  t,
}: {
  guestPhoneNumber: string;
  handleFinishTrip: (messageToGuest: string) => Promise<void>;
  handleCancel: () => void;
  t: TFunction;
}) {
  const [messageToGuest, setMessageToGuest] = useState("");
  const telLink = `tel:${guestPhoneNumber}`;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-rentality-secondary">Finish the trip without guest confirmation</p>
      <p>You can complete the trip without guest confirmation and the car will be available for booking.</p>
      <p>You will not receive the earnings until the guest confirms the completion of the trip.</p>

      <RntInputMultiline
        className="mt-6"
        id="message"
        rows={2}
        label="Message to guest (optional)"
        value={messageToGuest}
        onChange={(e) => setMessageToGuest(e.target.value)}
      />
      <RntButton className="my-1 w-full" onClick={() => handleFinishTrip(messageToGuest)}>
        Finish the trip without guest confirmation
      </RntButton>
      <a className="w-full" href={telLink}>
        <RntButtonTransparent className="my-1 w-full">Contact to guest</RntButtonTransparent>
      </a>
      <RntButtonTransparent className="my-1 w-full" onClick={handleCancel}>
        Cancel
      </RntButtonTransparent>
    </div>
  );
}

export default memo(ModifyTripForm);

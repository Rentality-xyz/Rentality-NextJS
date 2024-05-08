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
    <div className="w-full flex flex-col gap-2 items-center">
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
      <RntButton className="w-full my-1" onClick={() => handleFinishTrip(messageToGuest)}>
        Finish the trip without guest confirmation
      </RntButton>
      <a className="w-full" href={telLink}>
        <RntButtonTransparent className="w-full my-1">Contact to guest</RntButtonTransparent>
      </a>
      <RntButtonTransparent className="w-full my-1" onClick={handleCancel}>
        Cancel
      </RntButtonTransparent>
    </div>
  );
}

export default memo(ModifyTripForm);

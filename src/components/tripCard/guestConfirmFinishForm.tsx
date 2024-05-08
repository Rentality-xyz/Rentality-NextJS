import { memo } from "react";
import { TFunction } from "i18next";
import RntButtonTransparent from "../common/rntButtonTransparent";
import RntButton from "../common/rntButton";
import RntInputMultiline from "../common/rntInputMultiline";

function GuestConfirmFinishForm({
  hostPhoneNumber,
  messageFromHost,
  handleFinishTrip,
  handleCancel,
  t,
}: {
  hostPhoneNumber: string;
  messageFromHost: string;
  handleFinishTrip: () => Promise<void>;
  handleCancel: () => void;
  t: TFunction;
}) {
  const telLink = `tel:${hostPhoneNumber}`;

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <p className="text-rentality-secondary">Confirm finish trip</p>
      <p>Host finished the trip without guest confirmation.</p>
      <p>Please confirm finish trip or contact the host.</p>

      <RntInputMultiline
        className="mt-6"
        id="message"
        readOnly={true}
        rows={2}
        label="Message from your Host"
        value={messageFromHost}
      />
      <RntButton className="w-full my-1" onClick={() => handleFinishTrip()}>
        I confirm finish trip
      </RntButton>
      <a className="w-full" href={telLink}>
        <RntButtonTransparent className="w-full my-1">Contact to host</RntButtonTransparent>
      </a>
      <RntButtonTransparent className="w-full my-1" onClick={handleCancel}>
        Cancel
      </RntButtonTransparent>
    </div>
  );
}

export default memo(GuestConfirmFinishForm);

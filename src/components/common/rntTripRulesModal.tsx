import * as React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import RntButton from "./rntButton";
import tripRulesNoSmoking from "@/images/trip_rules_no_smoking.png";
import tripRulesNoStartReturn from "@/images/trip_rules_start_return.png";
import tripRulesLicense from "@/images/trip_rules_license.png";
import tripRulesRefuelling from "@/images/trip_rules_refuelling.png";
import tripRulesKeepTheVehicleTidy from "@/images/trip_rules_keep_the_vehicle_tidy.png";
import tripRulesTollsAndTickets from "@/images/trip_rules_tolls_and_tickets.png";
import tripRulesDistanceIncluded from "@/images/trip_rules_distance_included.png";
import tripRulesGuestToHostCommunication from "@/images/trip_rules_host_to_guest_communications.png";
import tripRulesCarSharingAgreement from "@/images/trip_rules_car_sharing_agreement.png";
import Image from "next/image";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

export default function RntTripRulesModal({}: {}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <RntButtonTransparent className="w-36" onClick={handleClickOpen}>
        <div className="text-rentality-secondary">
          <strong className="text-l">Trip Rules</strong>
        </div>
      </RntButtonTransparent>
      <Dialog
        maxWidth="md"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "40px",
            background: "#240F50",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#240F50",
          }}
        >
          <div className="text-rentality-secondary">Trip rules</div>
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
            <div className="flex flex-col md:grid md:grid-cols-3 md:gap-4">
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesNoStartReturn} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>1. Start and Return on time</strong>
                    <div className="text-gray-500">
                      Start and end your trip on time according to the time in the reservation order.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesLicense} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>2. Keep your license handy</strong>
                    <div className="text-gray-500">
                      Make sure to carry your physical driver`&apos;s license with you whenever you`&apos;re behind the
                      wheel.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesRefuelling} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>3. Refuel the vehicle</strong>
                    <div className="text-gray-500">
                      Please return the vehicle with the same fuel level you started with. You`&apos;ll be charged
                      retroactively for any missing fuel/battery charge.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesNoSmoking} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>4. No smoking</strong>
                    <div className="text-gray-500">
                      Guests who violate the no-smoking policy may be imposed by the host, and may be banned from the
                      platform.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesKeepTheVehicleTidy} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>5. Keep the vehicle tidy</strong>
                    <div className="text-gray-500">
                      If the vehicle is found to be unreasonably dirty upon return, you may be subject to a cleaning
                      fine by the host.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesTollsAndTickets} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>6. Tolls and tickets</strong>
                    <div className="text-gray-500">
                      You’re responsible for paying the cost of any certain tickets, tolls or fees incurred during your
                      trip. Hosts may request reimbursement within 90 days post-trip.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesDistanceIncluded} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>7. Distance included in trip</strong>
                    <div className="text-gray-500">
                      In your trip receipt indicates distance included per trip and price per 1 overmile. For any
                      additional miles driven, you`&apos;ll be charged.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesGuestToHostCommunication} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>8. Guest-to-host communication</strong>
                    <div className="text-gray-500">
                      In case of extraordinary situations, immediately contact the host via chat and phone number
                      indicated in the trip card.
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex">
                  <div className="mx-3 mt-1 w-1/12">
                    <Image src={tripRulesCarSharingAgreement} width={60} height={60} alt="" />
                  </div>
                  <div className="w-11/12">
                    <strong>9. Car sharing agreement</strong>
                    <div className="text-gray-500">
                      Check Car sharing agreement and have it handy which can be found and downloaded in Trip details.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#240F50",
            justifyContent: "center",
          }}
        >
          <RntButton onClick={handleClose} autoFocus>
            Got it
          </RntButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

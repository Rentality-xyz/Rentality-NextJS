import * as React from "react";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import RntButton from "./rntButton";
import { DialogTitle } from "@mui/material";
import Image from "next/image";
import tripRulesNoSmoking from "@/images/trip_rules_no_smoking.png";
import tripRulesNoStartReturn from "@/images/trip_rules_start_return.png";
import tripRulesLicense from "@/images/trip_rules_license.png";
import tripRulesRefuelling from "@/images/trip_rules_refuelling.png";
import tripRulesKeepTheVehicleTidy from "@/images/trip_rules_keep_the_vehicle_tidy.png";
import tripRulesTollsAndTickets from "@/images/trip_rules_tolls_and_tickets.png";
import tripRulesDistanceIncluded from "@/images/trip_rules_distance_included.png";
import tripRulesGuestToHostCommunication from "@/images/trip_rules_host_to_guest_communications.png";
import tripRulesCarSharingAgreement from "@/images/trip_rules_car_sharing_agreement.png";
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
        <div className="text-[#52D1C9]">
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
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#240F50",
          }}
        >
          <div className="text-[#52D1C9]">Trip rules</div>
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
            <div className="grid gap-4 grid-cols-3">
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesNoStartReturn} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Start and return on time</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesLicense} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Keep you license handy</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesRefuelling} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Refuel the vehicle</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesNoSmoking} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>No smoking</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesKeepTheVehicleTidy} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Keep the vehicle tidy</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesTollsAndTickets} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Talls And Tickets</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesDistanceIncluded} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Distance included in trip</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesGuestToHostCommunication} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Guest-to-Host communication</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rentality-bg p-2">
                <div className="flex flex-row">
                  <div className="mx-3 mt-1">
                    <Image src={tripRulesGuestToHostCommunication} width={60} height={60} alt="" />
                  </div>
                  <div>
                    <p>
                      <strong>Car sharing agreement</strong>
                    </p>
                    <div className="text-gray-500">
                      Guests who violate the non-smoking policy may be subject to a 150 CA$ fine and may be banned from
                      the platform
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

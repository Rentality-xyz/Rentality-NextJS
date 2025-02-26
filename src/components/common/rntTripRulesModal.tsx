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
import Image, { StaticImageData } from "next/image";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";

export default function RntTripRulesModal({ buttonClassName }: { buttonClassName?: string }) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <RntButtonTransparent className={cn("w-36", buttonClassName)} onClick={handleClickOpen}>
        <div className="text-rentality-secondary">
          <strong className="text-lg">{t("trip_rules.trip_rules")}</strong>
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
          <div className="text-rentality-secondary">{t("trip_rules.trip_rules")}</div>
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
              <TripRuleCard
                iconSrc={tripRulesNoStartReturn}
                title={t("trip_rules.rule_1_title")}
                text={t("trip_rules.rule_1_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesLicense}
                title={t("trip_rules.rule_2_title")}
                text={t("trip_rules.rule_2_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesRefuelling}
                title={t("trip_rules.rule_3_title")}
                text={t("trip_rules.rule_3_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesNoSmoking}
                title={t("trip_rules.rule_4_title")}
                text={t("trip_rules.rule_4_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesKeepTheVehicleTidy}
                title={t("trip_rules.rule_5_title")}
                text={t("trip_rules.rule_5_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesTollsAndTickets}
                title={t("trip_rules.rule_6_title")}
                text={t("trip_rules.rule_6_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesDistanceIncluded}
                title={t("trip_rules.rule_7_title")}
                text={t("trip_rules.rule_7_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesGuestToHostCommunication}
                title={t("trip_rules.rule_8_title")}
                text={t("trip_rules.rule_8_text")}
              />
              <TripRuleCard
                iconSrc={tripRulesCarSharingAgreement}
                title={t("trip_rules.rule_9_title")}
                text={t("trip_rules.rule_9_text")}
              />
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
            {t("trip_rules.got_it")}
          </RntButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

function TripRuleCard({ iconSrc, title, text }: { iconSrc: StaticImageData; title: string; text: string }) {
  return (
    <div className="bg-rentality-bg p-2">
      <div className="flex">
        <div className="mx-3 mt-1 w-1/12">
          <Image src={iconSrc} width={60} height={60} alt="" />
        </div>
        <div className="w-11/12">
          <strong>{title}</strong>
          <div className="text-gray-500">{text}</div>
        </div>
      </div>
    </div>
  );
}

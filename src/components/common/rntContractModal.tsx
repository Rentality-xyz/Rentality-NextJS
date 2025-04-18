import * as React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import RntButton from "./rntButton";
import { TripInfo } from "@/model/TripInfo";
import moment from "moment";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { dateFormatLongMonthYearDateTime, dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { getMilesIncludedPerDayText, isUnlimitedMiles } from "@/model/HostCarInfo";
import {
  LEGAL_CANCELLATION_NAME,
  LEGAL_PRIVACY_NAME,
  LEGAL_PROHIBITEDUSES_NAME,
  LEGAL_TERMS_NAME,
  UTC_TIME_ZONE_ID,
} from "@/utils/constants";
import useUserMode from "@/hooks/useUserMode";

export default function RntContractModal({ tripId, tripInfo }: { tripId: bigint; tripInfo: TripInfo }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { userMode, isHost } = useUserMode();
  const pathnameUserMode = isHost(userMode) ? "/host" : "/guest";

  return (
    <React.Fragment>
      <RntButton className="h-10 w-64" onClick={handleClickOpen}>
        Download the contract
      </RntButton>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "20px",
          },
        }}
      >
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
            <div className="m-4 flex flex-col">
              <div className="m-4 flex flex-col">
                <h1
                  className={`mb-4 text-4xl ${tripInfo.isTripCanceled || tripInfo.isTripRejected ? "text-rentality-alert-text" : ""}`}
                >
                  Car sharing agreement #{tripId.toString()}{" "}
                  {tripInfo.isTripCanceled
                    ? "canceled, payments refunded to the guest. "
                    : tripInfo.isTripRejected
                      ? "rejected, payments refunded to the guest. "
                      : null}
                </h1>
                <h3 className="mb-1 text-2xl">
                  {tripInfo.guest.name}’s trip with {tripInfo.host.name}’s {tripInfo.brand} {tripInfo.model}{" "}
                  {tripInfo.year}
                </h3>
                <p>
                  Refer to this document for evidence of your Rentality trip transaction when interacting with law
                  enforcement, insurance providers, roadside service providers, impound lot attendants, or others.
                </p>
                <h4 className="mb-1 text-xl">Key agreement facts</h4>
                <ol className="list-inside list-decimal [counter-reset:section]">
                  <li className="marker:[content:counters(section,'. ')] [counter-increment:section]">
                    During the car sharing period (see in Trip Summary “Trip Start” and “Trip End”), the person “Guest”
                    named below was given permission to drive the vehicle listed below by the “Host” (either the car
                    owner or an authorized representative) in accordance with Rentality&apos;s terms of service, to
                    which both the Guest and the Host have agreed. The terms are detailed in the following documents:
                    <ol className="ms-3 list-inside list-decimal [counter-reset:section]">
                      <li className="[counter-increment:section] marker:[content:counters(section,'.')]">
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_TERMS_NAME}`}
                          target="_blank"
                        >
                          Terms of service
                        </a>
                        &nbsp;
                        <a className="underline" href={`/host/legal?tab=${LEGAL_TERMS_NAME}`} target="_blank">
                          (published at https://app.rentality.io/legalmatters/terms)
                        </a>
                      </li>
                      <li className="[counter-increment:section] marker:[content:counters(section,'.')]">
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_CANCELLATION_NAME}`}
                          target="_blank"
                        >
                          Cancellation policy
                        </a>
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_CANCELLATION_NAME}`}
                          target="_blank"
                        >
                          (published at https://app.rentality.io/legalmatters/cancellation)
                        </a>
                      </li>
                      <li className="[counter-increment:section] marker:[content:counters(section,'.')]">
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_PROHIBITEDUSES_NAME}`}
                          target="_blank"
                        >
                          Prohibited Uses
                        </a>
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_PROHIBITEDUSES_NAME}`}
                          target="_blank"
                        >
                          (published at https://app.rentality.io/legalmatters/prohibiteduses)
                        </a>
                      </li>
                      <li className="[counter-increment:section] marker:[content:counters(section,'.')]">
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_PRIVACY_NAME}`}
                          target="_blank"
                        >
                          Privacy policy
                        </a>
                        &nbsp;
                        <a
                          className="underline"
                          href={`${pathnameUserMode}/legal?tab=${LEGAL_PRIVACY_NAME}`}
                          target="_blank"
                        >
                          (published at https://app.rentality.io/legalmattersprivacy)
                        </a>
                      </li>
                    </ol>
                  </li>
                  <li className="marker:[content:counters(section,'. ')] [counter-increment:section]">
                    The Terms of service, together with the Cancellation Policy, Prohibited Uses and Privacy Policy
                    constitute this Car sharing agreement between the person identified as “Guest” and the person
                    identified as “Host”.
                  </li>
                  <li className="marker:[content:counters(section,'. ')] [counter-increment:section]">
                    Rentality is a digital peer-to-peer car sharing platform, connecting private car owners who want to
                    rent out their vehicles with individuals seeking to use them for a fee.
                  </li>
                  <li className="marker:[content:counters(section,'. ')] [counter-increment:section]">
                    By listing their car on the Rentality platform, the Host confirms that their vehicle is safe,
                    well-maintained, legally registered, and covered by their personal insurance.
                  </li>
                </ol>
              </div>
              <div className="m-4 flex flex-col">
                <div className="text-xl">BASIC AGREEMENT INFORMATION</div>
                <div className="text-xl">GUEST INFORMATION</div>
                <div className="">Guest name: {tripInfo.guest.name}</div>
                <div className="">Driving license number: {tripInfo.guest.drivingLicenseNumber}</div>
                <div className="">
                  Driving license validity period:{" "}
                  {dateFormatShortMonthDateYear(tripInfo.guest.drivingLicenseExpirationDate, UTC_TIME_ZONE_ID)}
                </div>
                <div className="">Guest insurance information:</div>
                <div className="">Insurance company name: {tripInfo.guestInsuranceCompanyName}</div>
                <div className="">Insurance policy number: {tripInfo.guestInsurancePolicyNumber}</div>
                <div className="text-xl">HOST (CAR OWNER OR AUTHORIZED REPRESENTATIVE) INFORMATION</div>
                <div className="">Host name: {tripInfo.host.name}</div>
                <div className="">Driving license number: {tripInfo.host.drivingLicenseNumber}</div>
                <div className="">
                  Driving license validity period:{" "}
                  {dateFormatShortMonthDateYear(tripInfo.host.drivingLicenseExpirationDate, UTC_TIME_ZONE_ID)}
                </div>
                <div className="text-xl">VEHICLE INFORMATION</div>
                <div className="">
                  Vehicle Brand and Model: {tripInfo.brand} {tripInfo.model}
                </div>
                <div className="">Year of manufacture: {tripInfo.year}</div>
                <div className="">License plate: {tripInfo.licensePlate}</div>
                <div className="">VIN {tripInfo.carVinNumber}</div>
                <div className="text-xl">TRIP SUMMARY</div>
                <div className="">Reservation ID {tripInfo.tripId}</div>
                <div className="">
                  Booked ON: {dateFormatLongMonthYearDateTime(tripInfo.createdDateTime, tripInfo.timeZoneId)}
                </div>
                <div className="">Trip days: {moment(tripInfo.tripEnd).diff(tripInfo.tripStart, "days")}</div>
                <div className="">
                  Price per day: ETH {tripInfo.pricePerDayInUsd / tripInfo.currencyRate} (USD{" "}
                  {displayMoneyWith2Digits(tripInfo.pricePerDayInUsd)})
                </div>
                <div className="">
                  Trip start: {dateFormatLongMonthYearDateTime(tripInfo.tripStart, tripInfo.timeZoneId)}
                </div>
                <div className="">
                  Trip end: {dateFormatLongMonthYearDateTime(tripInfo.tripEnd, tripInfo.timeZoneId)}
                </div>
                <div className="">Pickup location: {tripInfo.locationStart}</div>
                <div className="">Return location: {tripInfo.locationEnd}</div>
                <div className="">Primary driver: {tripInfo.guest.name}</div>
                <div className="">
                  Miles included: {getMilesIncludedPerDayText(tripInfo.milesIncludedPerDay)}
                  {isUnlimitedMiles(tripInfo.milesIncludedPerDay) ? " miles" : " per day"}
                </div>
                <div className="text-xl">TRANSACTION INFORMATION</div>
                <div className="">Transaction currency: ETH</div>
                <div className="">Currency rate ETH to USD: {tripInfo.currencyRate}</div>
                <div className="">
                  Trip price: ETH {tripInfo.totalDayPriceInUsd / tripInfo.currencyRate} (USD{" "}
                  {displayMoneyWith2Digits(tripInfo.totalDayPriceInUsd)})
                </div>
                <div className="">
                  Discount ETH{" "}
                  {(tripInfo.totalDayPriceInUsd - tripInfo.totalPriceWithHostDiscountInUsd) / tripInfo.currencyRate}{" "}
                  (USD {displayMoneyWith2Digits(tripInfo.totalDayPriceInUsd - tripInfo.totalPriceWithHostDiscountInUsd)}
                  )
                </div>
                <div className="">
                  Delivery fee to Pick-Up location: ETH {tripInfo.pickUpDeliveryFeeInUsd / tripInfo.currencyRate} (USD{" "}
                  {displayMoneyWith2Digits(tripInfo.pickUpDeliveryFeeInUsd)}){" "}
                </div>
                <div className="">
                  Delivery fee from Drop-Off location: ETH {tripInfo.dropOffDeliveryFeeInUsd / tripInfo.currencyRate}{" "}
                  (USD {displayMoneyWith2Digits(tripInfo.dropOffDeliveryFeeInUsd)}){" "}
                </div>
                {tripInfo.taxesData.map((t) => (
                  <div className="" key={t.name + tripId}>
                    {t.name}: ETH {t.value / tripInfo.currencyRate} (USD {displayMoneyWith2Digits(t.value)}){" "}
                  </div>
                ))}
                <div className="">
                  Total charge: ETH {tripInfo.totalPriceInUsd / tripInfo.currencyRate} (USD{" "}
                  {displayMoneyWith2Digits(tripInfo.totalPriceInUsd)})
                </div>
                <div className="text-xl">Additional transactions </div>
                <div className="">
                  Security deposit: ETH {tripInfo.depositInUsd / tripInfo.currencyRate} (USD{" "}
                  {displayMoneyWith2Digits(tripInfo.depositInUsd)})
                </div>
                <div className="">
                  {isUnlimitedMiles(tripInfo.milesIncludedPerDay)
                    ? `Price per 1 overmile: ${getMilesIncludedPerDayText(tripInfo.milesIncludedPerDay)} miles`
                    : `Price per 1 overmile: ETH ${tripInfo.overmilePrice / tripInfo.currencyRate} (USD ${displayMoneyWith2Digits(tripInfo.overmilePrice)})`}
                </div>
                <div className="">
                  Price for each 10% battery charge or tank refueling: ETH{" "}
                  {tripInfo.pricePer10PercentFuel / tripInfo.currencyRate} (USD{" "}
                  {displayMoneyWith2Digits(tripInfo.pricePer10PercentFuel)})
                </div>
                {tripInfo.insuranceTotalInUsd > 0 && (
                  <div className="">
                    Insurance fee ${displayMoneyWith2Digits(tripInfo.insurancePerDayInUsd)}/day: ETH{" "}
                    {tripInfo.insuranceTotalInUsd / tripInfo.currencyRate} (USD{" "}
                    {displayMoneyWith2Digits(tripInfo.insuranceTotalInUsd)})
                  </div>
                )}
              </div>
              <div className="m-4 flex flex-col">
                The person identified as “Guest” and the person identified as “Host” on the Basic Agreement Information
                above were connected online through a website or mobile application provided by Rentality (collectively,
                the “Rentality Services”). As part of connecting through the Rentality Services, the Host and Guest
                agreed to be bound by the Terms of service, Cancellation policy, Prohibited Uses and Privacy Policy
                published at https://rentality.io/policies/terms. The guest who booked the trip on the Rentality
                platform is recognized as the &quot;Primary Driver&quot; and is liable under these Terms and Conditions,
                whether or not he or she was personally driving the vehicle.
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
          <RntButton onClick={handleClose}>Disagree</RntButton>
          <RntButton onClick={handleClose} autoFocus>
            Agree
          </RntButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

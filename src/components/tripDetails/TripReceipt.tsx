import React from "react";
import RntContractModal from "../common/rntContractModal";
import TripContacts from "../common/tripContacts";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useTranslation } from "react-i18next";
import { TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import { calculateDays, UTC_TIME_ZONE_ID } from "@/utils/date";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import UserAvatarWithName from "../common/userAvatarWithName";
import { isEmpty } from "@/utils/string";
import { isHost, UserMode } from "@/hooks/useUserMode";
import RntGalleryLink from "../common/RntGalleryLink";
import { InsuranceType } from "@/model/blockchain/schemas";

function TripReceipt({ tripId, tripInfo, userMode }: { tripId: bigint; tripInfo: TripInfo; userMode: UserMode }) {
  const { t } = useTranslation();

  const t_details: TFunction = (name, options) => {
    return t("booked.details." + name, options);
  };

  return (
    <div className="rnt-card my-2 flex flex-col overflow-hidden rounded-xl bg-rentality-bg xl:ml-2">
      <div className="flex grow flex-row p-2">
        {tripInfo.isTripCanceled ? (
          <strong className="text-2xl text-[#FF0000]">{t_details("trip_receipt_canceled")}</strong>
        ) : tripInfo.isTripRejected ? (
          <strong className="text-2xl text-[#FF0000]">{t_details("trip_receipt_rejected")}</strong>
        ) : (
          <strong className="text-2xl text-rentality-secondary">{t_details("trip_receipt")}</strong>
        )}
      </div>
      <div className="flex grow flex-row p-2">
        {t_details("reservation")} # {tripInfo.tripId}
        {tripInfo.isTripCanceled ? (
          <span className="text-[#FF0000]">&nbsp;({t_details("canceled")})</span>
        ) : tripInfo.isTripRejected ? (
          <span className="text-[#FF0000]">&nbsp;({t_details("rejected")})</span>
        ) : null}
      </div>
      <hr className="my-4" />
      <table className="m-2">
        <tbody>
          <tr>
            <td>{t_details("price_per_day")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.pricePerDayInUsd)}</td>
          </tr>
          <tr>
            <td>{t_details("trip_days")}</td>
            <td className="text-end">{calculateDays(tripInfo.tripStart, tripInfo.tripEnd)}</td>
          </tr>
          <tr>
            <td>{t_details("trip_price")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.totalDayPriceInUsd)}</td>
          </tr>
          <tr>
            <td>{t_details("discount_amount")}</td>
            <td className="text-end text-rentality-alert-text">
              -${displayMoneyWith2Digits(tripInfo.totalDayPriceInUsd - tripInfo.totalPriceWithDiscountInUsd)}
            </td>
          </tr>
          <tr>
            <td>{t_details("pickUp_delivery_fee")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.pickUpDeliveryFeeInUsd)}</td>
          </tr>
          <tr>
            <td>{t_details("dropOff_delivery_fee")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.dropOffDeliveryFeeInUsd)}</td>
          </tr>
          <tr>
            <td>{t_details("sales_tax")}</td>
            <td className="text-end">${tripInfo.salesTaxInUsd}</td>
          </tr>
          <tr>
            <td>{t_details("government_tax")}</td>
            <td className="text-end">${tripInfo.governmentTaxInUsd}</td>
          </tr>
          <tr>
            <td className="pt-5">
              <strong>{t_details("total_charge")}</strong>
            </td>
            <td className="pt-5 text-end">${displayMoneyWith2Digits(tripInfo.totalPriceInUsd)}</td>
          </tr>
        </tbody>
      </table>
      <hr className="my-4" />
      <div className="flex grow flex-row p-2 text-rentality-secondary">{t_details("security_deposit_info")}:</div>
      <table className="m-2">
        <tbody>
          <tr>
            <td>{t_details("received")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.depositInUsd)}</td>
          </tr>
          <tr>
            <td>{t_details("reimbursement")}</td>
            <td className="text-end text-rentality-alert-text">
              -${displayMoneyWith2Digits(tripInfo.resolveAmountInUsd)}
            </td>
          </tr>
          <tr>
            <td>{t_details("returned")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.depositReturnedInUsd)}</td>
          </tr>
        </tbody>
      </table>
      <hr className="my-4" />
      <div className="flex grow flex-row p-2 text-rentality-secondary">{t_details("insurance_info")}:</div>
      <table className="m-2">
        <tbody>
          <tr>
            <td>{t_details("insurance_fee_per_day", { insurancePerDayInUsd: tripInfo.insurancePerDayInUsd })}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.insuranceTotalInUsd)}</td>
          </tr>
        </tbody>
      </table>
      <hr className="my-4" />
      <div className="flex grow flex-row p-2 text-rentality-secondary">{t_details("reimbursement_info")}:</div>
      <table className="m-2">
        <tbody>
          <tr>
            <td>{t_details("pickUp_fuel")}</td>
            <td className="text-end">{tripInfo.startFuelLevelInPercents}%</td>
          </tr>
          <tr>
            <td>{t_details("dropOff_fuel")}</td>
            <td className="text-end">{tripInfo.endFuelLevelInPercents}%</td>
          </tr>
          <tr>
            <td>{t_details("price_per_10_percents")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.pricePer10PercentFuel)}</td>
          </tr>
          <tr>
            <td>{t_details("total_refuel_charge")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.resolveFuelAmountInUsd)}</td>
          </tr>
          <tr>
            <td>{t_details("miles_included_per_trip")}</td>
            <td className="text-end">{getMilesIncludedPerDayText(tripInfo.milesIncludedPerTrip)} ml</td>
          </tr>
          <tr>
            <td>{t_details("overmiles")}</td>
            <td className="text-end">{tripInfo.overmileValue} ml</td>
          </tr>
          <tr>
            <td>{t_details("price_per_one_overmile")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.overmilePrice)}</td>
          </tr>
          <tr>
            <td>{t_details("overmile_charge")}</td>
            <td className="text-end">${displayMoneyWith2Digits(tripInfo.resolveMilesAmountInUsd)}</td>
          </tr>
          <tr>
            <td className="pt-5">
              <strong>{t_details("total_reimbursement")}</strong>
            </td>
            <td className="pt-5 text-end">${displayMoneyWith2Digits(tripInfo.resolveAmountInUsd)}</td>
          </tr>
        </tbody>
      </table>
      <hr className="my-4" />
      <div className="flex grow flex-row p-2 text-rentality-secondary">{t_details("vehicle_dashboard_data")}:</div>
      <table className="m-2">
        <tbody>
          <tr>
            <td>{t_details("start_fuel_or_battery_level")}</td>
            <td className="text-end">{tripInfo.startFuelLevelInPercents}%</td>
          </tr>
          <tr>
            <td>{t_details("end_fuel_or_battery_level")}</td>
            <td className="text-end">{tripInfo.endFuelLevelInPercents}%</td>
          </tr>
          <tr>
            <td>{t_details("start_odometer")}</td>
            <td className="text-end">{tripInfo.startOdometr}</td>
          </tr>
          <tr>
            <td>{t_details("end_odometer")}</td>
            <td className="text-end">{tripInfo.endOdometr}</td>
          </tr>
        </tbody>
      </table>
      <hr className="my-4" />
      <div className="p-4">
        <div className="mb-3">
          <UserAvatarWithName photoUrl={tripInfo.guest.photoUrl} userName={tripInfo.guest.name} label="Guest" />
        </div>
        <table className="m-2">
          <tbody>
            <tr>
              <td>{t_details("dl_number")}:</td>
              <td className="text-end">{tripInfo.guest.drivingLicenseNumber}</td>
            </tr>
            <tr>
              <td>{t_details("dl_validity_period")}:</td>
              <td className="text-end">
                {dateFormatShortMonthDateYear(tripInfo.guest.drivingLicenseExpirationDate, UTC_TIME_ZONE_ID)}
              </td>
            </tr>
            <tr>
              <td>{t_details("dl_issue_country")}:</td>
              <td className="text-end">{tripInfo.guest.drivingLicenseIssueCountry}</td>
            </tr>
          </tbody>
        </table>
        <hr className="my-4" />
        <div className="flex grow flex-row p-2 text-rentality-secondary">{t_details("insurance")}:</div>
        <table className="m-2">
          <tbody>
            <tr>
              <td>
                {tripInfo.guestInsuranceType === InsuranceType.General
                  ? "General Insurance ID"
                  : tripInfo.guestInsuranceType === InsuranceType.OneTime
                    ? "One-Time trip insurance"
                    : ""}
              </td>
              <td className="text-end">
                <RntGalleryLink photos={[tripInfo.guestInsurancePhoto]} />
              </td>
            </tr>
            <tr>
              <td>{t_details("insurance_policy_name")}:</td>
              <td className="text-end">{tripInfo.guestInsuranceCompanyName}</td>
            </tr>
            <tr>
              <td>{t_details("insurance_policy_number")}:</td>
              <td className="text-end">{tripInfo.guestInsurancePolicyNumber}</td>
            </tr>
          </tbody>
        </table>
        <hr className="my-4" />
        <TripContacts tripInfo={tripInfo} isHost={isHost(userMode)} phoneForHost={false} t={t} />
      </div>
      <div className="flex justify-center p-4">
        <RntContractModal tripId={tripId} tripInfo={tripInfo} />
      </div>
    </div>
  );
}

export default TripReceipt;

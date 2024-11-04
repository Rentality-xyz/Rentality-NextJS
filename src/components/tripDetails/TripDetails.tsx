import PageTitle from "../pageTitle/pageTitle";
import RntButton from "../common/rntButton";
import Image from "next/image";
import carDoorsIcon from "@/images/car_doors.svg";
import carSeatsIcon from "@/images/car_seats.svg";
import carTransmissionIcon from "@/images/car_transmission.svg";
import carTankSizeIcon from "@/images/car_tank_size.svg";
import carColourIcon from "@/images/car_colour.svg";
import { getEngineTypeIcon, getEngineTypeString } from "@/model/EngineType";
import moment from "moment";
import RntContractModal from "@/components/common/rntContractModal";
import useTripInfo from "@/hooks/useTripInfo";
import { useRouter } from "next/router";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import UserAvatarWithName from "@/components/common/userAvatarWithName";
import TripContacts from "@/components/common/tripContacts";
import { dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { UTC_TIME_ZONE_ID, calculateDays } from "@/utils/date";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import TripCardForDetails from "../tripCard/tripCardForDetails";
import useUserMode, { isHost } from "@/hooks/useUserMode";
import Loading from "../common/Loading";
import { useTranslation } from "react-i18next";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";

export default function TripInfo() {
  const { userMode } = useUserMode();
  const router = useRouter();
  const { tripId: tripIdQuery, back } = router.query;
  const { isAuthenticated } = useAuth();

  const tripId = BigInt((tripIdQuery as string) ?? "0");
  const backPath = back as string;

  const [isLoading, tripInfo] = useTripInfo(tripId);
  const { t } = useTranslation();

  const t_details: TFunction = (name, options) => {
    return t("booked.details." + name, options);
  };

  const formatStatusDateTime = (value: Date, timeZone?: string) => {
    const format = "ddd, D MMM YYYY hh:mm:ss z";
    return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
  };

  if (tripId == null || tripId === BigInt(0) || tripInfo == null) return null;

  return (
    <>
      <PageTitle title={t_details("title", { tripId: tripId.toString() })} />
      {isLoading && !isAuthenticated && <InvitationToConnect />}
      {!isLoading && (
        <>
          <TripCardForDetails key={Number(tripId)} isHost={isHost(userMode)} tripInfo={tripInfo} t={t} />

          <div className="my-6 flex flex-wrap">
            <div className="w-full xl:w-2/3">
              <div className="rnt-card my-2 flex flex-col rounded-xl bg-rentality-bg xl:mr-2">
                <div className="flex flex-col items-start justify-between p-2 sm:flex-row sm:items-center">
                  <div>
                    <strong className="text-2xl text-rentality-secondary">{t_details("about_car")}</strong>
                  </div>
                  <div className="max-sm:mt-2">VIN: {tripInfo.carVinNumber}</div>
                </div>
                <div className="flex grow flex-row p-2">
                  <strong className="text-xl text-rentality-secondary">{t_details("basic_car_details")}</strong>
                </div>
                <div className="flex flex-wrap p-2 max-sm:flex-col">
                  <div className="m-2 flex w-28 items-center">
                    <Image className="me-1" src={carDoorsIcon} width={30} height={30} alt="" />
                    {tripInfo.carDoorsNumber} {t_details("doors")}
                  </div>
                  <div className="m-2 flex w-28 items-center">
                    <Image className="me-1" src={carSeatsIcon} width={30} height={30} alt="" />
                    {tripInfo.carSeatsNumber} {t_details("seats")}
                  </div>
                  <div className="m-2 flex w-48 items-center">
                    <Image
                      className="me-1"
                      src={getEngineTypeIcon(tripInfo.engineType)}
                      width={50}
                      height={30}
                      alt=""
                    />
                    {t("vehicles.engine_type")} {getEngineTypeString(tripInfo.engineType)}
                  </div>
                  <div className="word-break m-2 flex w-40 items-center">
                    <Image className="me-1" src={carTransmissionIcon} width={30} height={30} alt="" />
                    {t("vehicles.transmission")}: {tripInfo.carTransmission}
                  </div>
                  <div className="m-2 flex w-44 items-center">
                    <Image className="me-1" src={carTankSizeIcon} width={30} height={30} alt="" />
                    {t("vehicles.tank_size")}: {tripInfo.tankVolumeInGal}
                  </div>
                  <div className="m-2 flex w-40 items-center">
                    <Image className="me-1" src={carColourIcon} width={30} height={30} alt="" />
                    {t_details("car_colour")}: {tripInfo.carColor}
                  </div>
                </div>
                <div className="flex grow flex-row p-2">
                  <strong className="text-xl text-rentality-secondary">{t_details("more_car_details")}</strong>
                </div>
                <div className="grow flex-row p-2">{tripInfo.carDescription}</div>
              </div>
              <div className="rnt-card my-2 flex flex-col overflow-hidden rounded-xl bg-rentality-bg xl:mr-2">
                <div className="flex flex-col p-2">
                  <div className="pb-3">
                    <strong className="text-2xl text-rentality-secondary">{t_details("trip_status_details")}</strong>
                  </div>
                  <div>
                    {tripInfo.createdDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Booked date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.createdDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.isTripRejected &&
                    tripInfo.rejectedBy === tripInfo.host.walletAddress &&
                    tripInfo.rejectedDate !== undefined ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Host Booked Cancellation:</div>
                        <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.isTripRejected &&
                    tripInfo.rejectedBy === tripInfo.guest.walletAddress &&
                    tripInfo.rejectedDate !== undefined ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Guest Cancellation before Host confirmed:</div>
                        <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.approvedDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Approved date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.approvedDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.isTripCanceled &&
                    tripInfo.rejectedBy === tripInfo.guest.walletAddress &&
                    tripInfo.rejectedDate !== undefined ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Guest Cancellation after host confirmed:</div>
                        <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.isTripCanceled &&
                    tripInfo.rejectedBy === tripInfo.host.walletAddress &&
                    tripInfo.rejectedDate !== undefined ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Host trip Cancellation:</div>
                        <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.checkedInByHostDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Checked-in by host date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.checkedInByHostDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.checkedInByGuestDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Checked-in by guest date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.checkedInByGuestDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.checkedOutByGuestDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Checked-out by guest date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.checkedOutByGuestDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.checkedOutByHostDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div> Checked-out by host date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.checkedOutByHostDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {tripInfo.finishedDateTime.getTime() > 0 ? (
                      <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                        <div>Completed by host date and time:</div>
                        <div className="ml-4">
                          {formatStatusDateTime(tripInfo.finishedDateTime, tripInfo.timeZoneId)}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-1/3">
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
                      <td className="text-rentality-alert-text text-end">
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
                <div className="flex grow flex-row p-2 text-rentality-secondary">
                  {t_details("security_deposit_info")}:
                </div>
                <table className="m-2">
                  <tbody>
                    <tr>
                      <td>{t_details("received")}</td>
                      <td className="text-end">${displayMoneyWith2Digits(tripInfo.depositInUsd)}</td>
                    </tr>
                    <tr>
                      <td>{t_details("reimbursement")}</td>
                      <td className="text-rentality-alert-text text-end">
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
                <div className="flex grow flex-row p-2 text-rentality-secondary">
                  {t_details("reimbursement_info")}:
                </div>
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
                <div className="flex grow flex-row p-2 text-rentality-secondary">
                  {t_details("vehicle_dashboard_data")}:
                </div>
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
                    <UserAvatarWithName
                      photoUrl={tripInfo.guest.photoUrl}
                      userName={tripInfo.guest.name}
                      label="Guest"
                    />
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
                    </tbody>
                  </table>
                  <TripContacts tripInfo={tripInfo} isHost={isHost(userMode)} phoneForHost={false} t={t} />
                </div>
                <div className="flex justify-center p-4">
                  <RntContractModal tripId={tripId} tripInfo={tripInfo} />
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8 mt-4 flex flex-row justify-center gap-4">
            <RntButton className="h-16 w-40" onClick={() => router.push(backPath)}>
              {t("common.back")}
            </RntButton>
          </div>
        </>
      )}
    </>
  );
}

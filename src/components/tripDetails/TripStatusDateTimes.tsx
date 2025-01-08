import { TripInfo } from "@/model/TripInfo";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";

function TripStatusDateTimes({ tripInfo }: { tripInfo: TripInfo }) {
  const { t } = useTranslation();

  return (
    <div className="rnt-card my-2 flex flex-col overflow-hidden rounded-xl bg-rentality-bg xl:mr-2">
      <div className="flex flex-col p-2">
        <div className="pb-3">
          <strong className="text-2xl text-rentality-secondary">{t("booked.details.trip_status_details")}</strong>
        </div>
        <div>
          {tripInfo.createdDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div>Booked date and time:</div>
              <div className="ml-4">{formatStatusDateTime(tripInfo.createdDateTime, tripInfo.timeZoneId)}</div>
            </div>
          )}
          {tripInfo.isTripRejected &&
            tripInfo.rejectedBy === tripInfo.host.walletAddress &&
            tripInfo.rejectedDate !== undefined && (
              <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                <div>Host Booked Cancellation:</div>
                <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
              </div>
            )}
          {tripInfo.isTripRejected &&
            tripInfo.rejectedBy === tripInfo.guest.walletAddress &&
            tripInfo.rejectedDate !== undefined && (
              <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                <div>Guest Cancellation before Host confirmed:</div>
                <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
              </div>
            )}
          {tripInfo.approvedDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div>Approved date and time:</div>
              <div className="ml-4">{formatStatusDateTime(tripInfo.approvedDateTime, tripInfo.timeZoneId)}</div>
            </div>
          )}
          {tripInfo.isTripCanceled &&
            tripInfo.rejectedBy === tripInfo.guest.walletAddress &&
            tripInfo.rejectedDate !== undefined && (
              <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                <div>Guest Cancellation after host confirmed:</div>
                <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
              </div>
            )}
          {tripInfo.isTripCanceled &&
            tripInfo.rejectedBy === tripInfo.host.walletAddress &&
            tripInfo.rejectedDate !== undefined && (
              <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
                <div>Host trip Cancellation:</div>
                <div className="ml-4">{formatStatusDateTime(tripInfo.rejectedDate, tripInfo.timeZoneId)}</div>
              </div>
            )}
          {tripInfo.checkedInByHostDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div>Checked-in by host date and time:</div>
              <div className="ml-4">{formatStatusDateTime(tripInfo.checkedInByHostDateTime, tripInfo.timeZoneId)}</div>
            </div>
          )}
          {tripInfo.checkedInByGuestDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div>Checked-in by guest date and time:</div>
              <div className="ml-4">{formatStatusDateTime(tripInfo.checkedInByGuestDateTime, tripInfo.timeZoneId)}</div>
            </div>
          )}
          {tripInfo.checkedOutByGuestDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div>Checked-out by guest date and time:</div>
              <div className="ml-4">
                {formatStatusDateTime(tripInfo.checkedOutByGuestDateTime, tripInfo.timeZoneId)}
              </div>
            </div>
          )}
          {tripInfo.checkedOutByHostDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div> Checked-out by host date and time:</div>
              <div className="ml-4">{formatStatusDateTime(tripInfo.checkedOutByHostDateTime, tripInfo.timeZoneId)}</div>
            </div>
          )}
          {tripInfo.finishedDateTime.getTime() > 0 && (
            <div className="flex items-start justify-between max-xl:mt-1 max-xl:flex-col xl:items-center">
              <div>Completed by host date and time:</div>
              <div className="ml-4">{formatStatusDateTime(tripInfo.finishedDateTime, tripInfo.timeZoneId)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatStatusDateTime(value: Date, timeZone?: string) {
  const format = "ddd, D MMM YYYY hh:mm:ss z";
  return timeZone ? moment(value).tz(timeZone).format(format) : moment(value).format(format);
}

export default TripStatusDateTimes;

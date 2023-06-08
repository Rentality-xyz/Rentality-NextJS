import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { dateFormat } from "@/utils/datetimeFormatters";
import { TripInfo, getTripStatusTextFromStatus } from "@/model/TripInfo";
import { useState } from "react";
import InputBlock from "../inputBlock";
import Button from "../common/button";

type Props = {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
};

export default function TripItem({ tripInfo, changeStatusCallback }: Props) {
  const [isAdditionalActionHidden, setIsAdditionalActionHidden] =
    useState(true);
  const [inputParams, setInputParams] = useState<string[]>([]);

  return (
    <div className="flex flex-col  rounded-xl bg-pink-100">
      <div className="flex flex-wrap">
        <div className="relative h-56 w-60 flex-shrink-0 rounded-l-xl bg-slate-400 text-center">
          <Image
            src={tripInfo.image}
            alt=""
            width={1000}
            height={1000}
            className="h-full w-full rounded-lg object-cover"
          />
          {/* <img
          src={tripInfo.image}
          alt=""
          className="h-full w-full rounded-lg object-cover"
        /> */}
          <div className="absolute right-0 top-2 px-8 py-2 text-gray-100 bg-purple-600 rounded-l-3xl">
            <strong className="text-m">{`${getTripStatusTextFromStatus(
              tripInfo.status
            )}`}</strong>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <div className="flex flex-col">
            <div>
              <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
            </div>
            <div>{tripInfo.licensePlate}</div>
            <div className="flex flex-col mt-4">
              <div>
                <strong className="text-l">Total price</strong>
              </div>
              <div>${tripInfo.totalPrice}</div>
            </div>
          </div>

          {!isAdditionalActionHidden ? null : (
            <div className="flex flex-row gap-4">
              {tripInfo.allowedActions.map((action) => {
                return (
                  <button
                    key={action.text}
                    className="h-16 w-full rounded-md bg-violet-700 px-4"
                    onClick={() => {
                      if (action.params == null || action.params.length == 0) {
                        changeStatusCallback(() => {
                          return action.action(tripInfo.tripId, []);
                        });
                      } else {
                        setIsAdditionalActionHidden(false);
                      }
                    }}
                  >
                    {action.text}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-col">
            <div>
              <strong className="text-l">📅 Trip start</strong>
            </div>
            <div className="whitespace-nowrap">
              {dateFormat(tripInfo.tripStart)}
            </div>
            {/* <div>April 05, 4:00 AM</div> */}
          </div>
          <div className="flex flex-col">
            <div>
              <strong className="text-l">📅 Trip end</strong>
            </div>
            <div className="whitespace-nowrap">
              {dateFormat(tripInfo.tripEnd)}
            </div>
            {/* <div>April 05, 4:00 AM</div> */}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-col">
            <div>
              <strong className="text-l whitespace-nowrap">
                📍 Pickup location
              </strong>
            </div>
            <div>{tripInfo.locationStart}</div>
            {/* <div>Miami, CA, USA</div> */}
          </div>
          <div className="flex flex-col">
            <div>
              <strong className="text-l whitespace-nowrap">
                📍 Return location
              </strong>
            </div>
            <div>{tripInfo.locationEnd}</div>
            {/* <div>Miami, CA, USA</div> */}
          </div>
        </div>
      </div>

      {isAdditionalActionHidden ||
      tripInfo.allowedActions == null ||
      tripInfo.allowedActions.length == 0 ||
      tripInfo.allowedActions[0].params == null ? null : (
        <div
          className="flex flex-col px-8 pt-2 pb-4"
          hidden={isAdditionalActionHidden}
        >
          <hr />
          <div>
            <strong className="text-xl">
              Please enter data to change status:
            </strong>
          </div>
          <div className="w-1/2 flex flex-col py-4">
            {tripInfo.allowedActions[0].params.map((param, index) => {
              return (
                <InputBlock
                  className="py-2"
                  key={param}
                  id={param}
                  label={param}
                  value={inputParams[index]}
                  setValue={(newValue) => {
                    setInputParams((prev) => {
                      const copy = [...prev];
                      copy[index] = newValue;
                      return copy;
                    });
                  }}
                />
              );
            })}
          </div>
          <Button
            onClick={() => {
              changeStatusCallback(() => {
                return tripInfo.allowedActions[0].action(
                  tripInfo.tripId,
                  inputParams
                );
              });
            }}
          >
            {tripInfo.allowedActions[0].text}
          </Button>
        </div>
      )}
    </div>
  );
}

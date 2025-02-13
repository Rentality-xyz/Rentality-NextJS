import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from "react";
// @ts-ignore
import carCarIcon from "@/images/upload-car-photo.png";
// @ts-ignore
import carSeatsIcon from "@/images/car_seats.png";
// @ts-ignore
import carDataIcon from "@/images/upload-car-data.png";
import Image from "next/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err } from "@/model/utils/result";
import { useTranslation } from "react-i18next";

const EXTERIOR_PHOTOS_COUNT_REQUIRED = 4;
const INTERIOR_PHOTOS_COUNT_REQUIRED = 9;
const DATA_PHOTOS_COUNT_REQUIRED = 2;
const MAX_FILE_COUNT = 16;

const CarPhotosUploadButton = forwardRef(function CarPhotosUploadButton(
  {
    isStart,
    isHost,
    tripId,
    isSimpleButton = false,
  } : {
    isStart: boolean,
    isHost: boolean,
    tripId: number,
    isSimpleButton?: boolean
  },
  ref
) {
  const ethereumInfo = useEthereum();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);

  const totalCount = useMemo(() => uploadedFiles?.length || 'no',
    [uploadedFiles?.length]);

  const { t } = useTranslation();

  useImperativeHandle(ref, () => ({
    async saveUploadedFiles() {

      const savedFilesURLs: string[] = [];

      if (uploadedFiles === null){
        return savedFilesURLs;
      }

      try {

        const isHostStringValue = isHost ? "host" : "guest";
        const isStartStringValue = isStart ? "start" : "finish";

        for (const uploadedFile of Array.from(uploadedFiles)) {

          const fileName = `${tripId}-${isHostStringValue}-${isStartStringValue}-${uploadedFile.name}`;

          const response = await uploadFileToIPFS(uploadedFile, fileName, {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo?.walletAddress ?? "",
            version: SMARTCONTRACT_VERSION,
            chainId: ethereumInfo?.chainId ?? 0,
            tripId: Number(tripId),
            isHost: isHostStringValue,
            isStart: isStartStringValue
          })

          if (!response.success || !response.pinataURL) {
            return Err(`Photo upload failed`);
          }

          savedFilesURLs.push(response.pinataURL);
        }
      } catch (e:any) {
        return Err(e.message);
      }

      return savedFilesURLs;
    }
  }),[ethereumInfo?.chainId, ethereumInfo?.walletAddress, isStart, tripId, uploadedFiles])

  return (
    <>
      <input
        type="file"
        className="flex invisible w-0 h-0"
        ref={fileInputRef}
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length <= MAX_FILE_COUNT) {
            setUploadedFiles(e.target.files)
          }
        }}
      />
      {isSimpleButton ? (
        <RntButtonTransparent
          className="my-1 w-full"
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
        >
          {t("common.trip_photos_upload_trip_photo")}
        </RntButtonTransparent>
      ) : (
        <RntButtonTransparent
          className="w-[20rem] bg-rentality-bg rounded-xl text-white border-gradient"
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
        >
          <div className="flex items-center justify-center text-md text-rentality-secondary p-2">
            Take a photo at {isStart ? "start" : "finish"}
          </div>
          <div className="flex items-center justify-center p-2">
            <div className="w-32 p-4 text-sm border-none">
              <div className="flex items-center justify-center">
                <Image className="me-1" src={carCarIcon} width={50} height={50} alt="" />
              </div>
              <div className="text-rentality-secondary">{t("common.exterior")}</div>
              <div>{EXTERIOR_PHOTOS_COUNT_REQUIRED}&nbsp;{t("common.required")}</div>
            </div>
            <div className="w-32 p-4 text-sm">
              <div className="flex items-center justify-center">
                <Image className="me-1" src={carSeatsIcon} width={50} height={50} alt="" />
              </div>
              <div className="text-rentality-secondary">{t("common.interior")}</div>
              <div>{INTERIOR_PHOTOS_COUNT_REQUIRED}&nbsp;{t("common.required")}</div>
            </div>
            <div className="w-32 p-4 text-sm">
              <div className="flex items-center justify-center">
                <Image className="me-1" src={carDataIcon} width={50} height={50} alt="" />
              </div>
              <div className="text-rentality-secondary">{t("common.data")}</div>
              <div>{DATA_PHOTOS_COUNT_REQUIRED}&nbsp;{t("common.required")}</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-2">
            <hr className="w-80 border-t-2" />
          </div>
          <div className="flex items-center justify-center p-2">
            <div className="text-sm">{totalCount}&nbsp;{t("common.trip_photos_photos")}&nbsp;{t("common.uploaded")}</div>
          </div>
        </RntButtonTransparent>
      )}

    </>
  )
})

export default CarPhotosUploadButton;
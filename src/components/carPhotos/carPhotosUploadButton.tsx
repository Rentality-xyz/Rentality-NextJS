//TODO translate
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err } from "@/model/utils/result";
import { useTranslation } from "react-i18next";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import RntButton from "@/components/common/rntButton";
import { logger } from "@/utils/logger";

const EXTERIOR_PHOTOS_COUNT_REQUIRED = 4;
const INTERIOR_PHOTOS_COUNT_REQUIRED = 9;
const DATA_PHOTOS_COUNT_REQUIRED = 2;
const MAX_FILE_COUNT = EXTERIOR_PHOTOS_COUNT_REQUIRED + INTERIOR_PHOTOS_COUNT_REQUIRED + DATA_PHOTOS_COUNT_REQUIRED;

const CarPhotosUploadButton = forwardRef(function CarPhotosUploadButton(
  {
    isStart,
    isHost,
    tripId,
    isSimpleButton = false,
  }: {
    isStart: boolean;
    isHost: boolean;
    tripId: number;
    isSimpleButton?: boolean;
  },
  ref
) {
  const ethereumInfo = useEthereum();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const { t } = useTranslation();
  const { showError } = useRntSnackbars();

  const totalCount = useMemo(() => uploadedFiles?.length || "no", [uploadedFiles?.length]);

  useImperativeHandle(
    ref,
    () => ({
      async saveUploadedFiles() {
        const savedFilesURLs: string[] = [];

        if (uploadedFiles === null) {
          return savedFilesURLs;
        }

        try {
          const isHostStringValue = isHost ? "host" : "guest";
          const isStartStringValue = isStart ? "start" : "finish";

          for (const uploadedFile of Array.from(uploadedFiles)) {
            const fileName = `${tripId}-${isHostStringValue}-${isStartStringValue}-${uploadedFile.name}`;

            logger.debug(`Uploading file ${fileName} to Pinata`);

            const response = await uploadFileToIPFS(uploadedFile, fileName, {
              createdAt: new Date().toISOString(),
              createdBy: ethereumInfo?.walletAddress ?? "",
              version: SMARTCONTRACT_VERSION,
              chainId: ethereumInfo?.chainId ?? 0,
              tripId: Number(tripId),
              isHost: isHostStringValue,
              isStart: isStartStringValue,
            });

            if (!response.success || !response.pinataURL) {
              return Err(`Photo upload failed`);
            }

            savedFilesURLs.push(response.pinataURL);
          }
        } catch (error) {
          return Err(error instanceof Error ? error.message : "unknown error");
        }

        return savedFilesURLs;
      },
    }),
    [ethereumInfo?.chainId, ethereumInfo?.walletAddress, isStart, tripId, uploadedFiles]
  );

  return (
    <>
      <input
        type="file"
        className="invisible flex h-0 w-0"
        ref={fileInputRef}
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length <= MAX_FILE_COUNT) {
            setUploadedFiles(e.target.files);
          } else {
            showError(`You can upload ${MAX_FILE_COUNT} photos maximum`);
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
        <div className="border-gradient w-[20rem] rounded-xl pb-2">
          <RntButton
            className="w-full bg-rentality-bg text-white"
            isVisibleCircle={false}
            onClick={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <div className="text-md flex items-center justify-center p-2 text-rentality-secondary">
              Take a photo at {isStart ? "start" : "finish"}
            </div>
            <div className="flex items-center justify-center p-2">
              <div className="w-32 border-none p-4 text-sm">
                <div className="flex items-center justify-center">
                  <Image className="me-1" src="/images/upload-car-photo.png" width={50} height={50} alt="" />
                </div>
                <div className="text-rentality-secondary">{t("common.exterior")}</div>
                <div>
                  {EXTERIOR_PHOTOS_COUNT_REQUIRED}&nbsp;{t("common.required")}
                </div>
              </div>
              <div className="w-32 p-4 text-sm">
                <div className="flex items-center justify-center">
                  <Image className="me-1" src="/images/car_seats.png" width={50} height={50} alt="" />
                </div>
                <div className="text-rentality-secondary">{t("common.interior")}</div>
                <div>
                  {INTERIOR_PHOTOS_COUNT_REQUIRED}&nbsp;{t("common.required")}
                </div>
              </div>
              <div className="w-32 p-4 text-sm">
                <div className="flex items-center justify-center">
                  <Image className="me-1" src="/images/upload-car-data.png" width={50} height={50} alt="" />
                </div>
                <div className="text-rentality-secondary">{t("common.data")}</div>
                <div>
                  {DATA_PHOTOS_COUNT_REQUIRED}&nbsp;{t("common.required")}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-2">
              <hr className="w-80 border-t-2" />
            </div>
            <div className="flex items-center justify-center p-2">
              <div className="text-sm">
                {totalCount}&nbsp;{t("common.trip_photos_photos")}&nbsp;{t("common.uploaded")}
              </div>
            </div>
          </RntButton>
        </div>
      )}
    </>
  );
});

export default CarPhotosUploadButton;

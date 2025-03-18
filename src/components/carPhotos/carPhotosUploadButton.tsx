//TODO translate
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { useTranslation } from "react-i18next";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import RntButton from "@/components/common/rntButton";
import { logger } from "@/utils/logger";
import { saveTripCarPhotos, UploadedUrlList } from "@/features/filestore/pinata/utils";

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
    wrapperClassName,
  }: {
    isStart: boolean;
    isHost: boolean;
    tripId: number;
    isSimpleButton?: boolean;
    wrapperClassName?: string;
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
      async saveUploadedFiles(): Promise<Result<UploadedUrlList>> {
        if (!ethereumInfo) {
          logger.error("saveUploadedFiles error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const savedFilesURLs: string[] = [];

        if (uploadedFiles === null) {
          return Ok({ urls: savedFilesURLs });
        }

        return saveTripCarPhotos(
          Array.from(uploadedFiles ?? []),
          ethereumInfo.chainId,
          tripId,
          isHost ? "host" : "guest",
          isStart ? "start" : "finish",
          {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo.walletAddress ?? "",
          }
        );
      },
    }),
    [ethereumInfo, isHost, isStart, tripId, uploadedFiles]
  );

  return (
    <div className={wrapperClassName}>
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
                  <Image className="me-1" src="/images/upload-car-seats.png" width={50} height={50} alt="" />
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
    </div>
  );
});

export default CarPhotosUploadButton;

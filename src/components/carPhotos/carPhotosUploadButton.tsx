import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import React, { Ref, useImperativeHandle, useMemo, useRef, useState } from "react";
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

const EXTERIOR_PHOTOS_COUNT_REQUIRED = 4;
const INTERIOR_PHOTOS_COUNT_REQUIRED = 9;
const DATA_PHOTOS_COUNT_REQUIRED = 2;
const MAX_FILE_COUNT = 16;

export default function CarPhotosUploadButton(
  {
    ref,
    isStart,
  } : {
    ref: Ref<any>,
    isStart: boolean
  }){

  const ethereumInfo = useEthereum();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);

  const totalCount = useMemo(() => uploadedFiles?.length || 'no',
    [uploadedFiles?.length]);

  useImperativeHandle(ref, () => ({
    async saveUploadedFiles() {

      const savedFilesURLs: string[] = [];

      if (uploadedFiles === null){
        return savedFilesURLs;
      }

      try {
        for (const uploadedFile of Array.from(uploadedFiles)) {
          const response = await uploadFileToIPFS(uploadedFile, "dfsdfsdf", {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo?.walletAddress ?? "",
            version: SMARTCONTRACT_VERSION,
            chainId: ethereumInfo?.chainId ?? 0,
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
  }))

  return (
    <>
      <input
        type="file"
        className="flex invisible w-0 h-0"
        onChange={(e) => {
        if (e.target.files && e.target.files.length <= MAX_FILE_COUNT) {
          setUploadedFiles(e.target.files)
        }
      }} ref={fileInputRef} multiple />
      <RntButtonTransparent
        className="w-[20rem] bg-rentality-bg rounded-xl text-white border-rnt-gradient-2"
        onClick={()=>fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-center text-md text-rentality-secondary p-2">
          Take a photo at {isStart ? "start" : "finish"}
        </div>
        <div className="flex items-center justify-center p-2">
          <div className="w-32 p-4 text-sm border-none">
            <div className="flex items-center justify-center">
              <Image className="me-1" src={carCarIcon} width={50} height={50} alt="" />
            </div>
            <div className="text-rentality-secondary">Exterior</div>
            <div>{EXTERIOR_PHOTOS_COUNT_REQUIRED}&nbsp;required</div>
          </div>
          <div className="w-32 p-4 text-sm">
            <div className="flex items-center justify-center">
              <Image className="me-1" src={carSeatsIcon} width={50} height={50} alt="" />
            </div>
            <div className="text-rentality-secondary">Interior</div>
            <div>{INTERIOR_PHOTOS_COUNT_REQUIRED}&nbsp;required</div>
          </div>
          <div className="w-32 p-4 text-sm">
            <div className="flex items-center justify-center">
              <Image className="me-1" src={carDataIcon} width={50} height={50} alt="" />
            </div>
            <div className="text-rentality-secondary">Data</div>
            <div>{DATA_PHOTOS_COUNT_REQUIRED}&nbsp;required</div>
          </div>
        </div>
        <div className="flex items-center justify-center p-2">
          <hr className="w-80 border-t-2" />
        </div>
        <div className="flex items-center justify-center p-2">
          <div className="text-sm">{totalCount}&nbsp;photos&nbsp;uploaded</div>
        </div>
      </RntButtonTransparent>
    </>
    )
  }
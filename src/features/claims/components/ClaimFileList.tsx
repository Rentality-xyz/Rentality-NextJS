import React from "react";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";

function ClaimFileList({ fileUrls, handleBackClick }: { fileUrls: string[]; handleBackClick: () => void }) {
  return (
    <div className="my-2 flex flex-col">
      <h2>View photo/file</h2>
      <div className="mt-4 flex flex-row gap-4">
        {fileUrls.map((fileUrl, index) => {
          return (
            <>
              <div
                key={index}
                className="h-40 w-48 cursor-pointer overflow-hidden rounded-2xl bg-gray-200/80"
                onClick={() => window.open(fileUrl)}
              >
                <Image className="h-full w-full object-cover" width={1000} height={1000} src={fileUrl} alt="" />
              </div>
            </>
          );
        })}
      </div>
      <RntButton className="mt-8 w-40 self-center" onClick={handleBackClick}>
        Back
      </RntButton>
    </div>
  );
}

export default ClaimFileList;

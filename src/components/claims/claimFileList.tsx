import React from "react";
import Image from "next/image";
import RntButton from "../common/rntButton";

function ClaimFileList({ fileUrls, handleBackClick }: { fileUrls: string[]; handleBackClick: () => void }) {
  return (
    <div className="my-2 flex flex-col">
      <h2>View photo/file</h2>
      <div className="flex flex-row gap-4 mt-4">
        {fileUrls.map((fileUrl, index) => {
          return (
            <>
              <div
                key={index}
                className="w-48 h-40 rounded-2xl overflow-hidden cursor-pointer bg-gray-200 bg-opacity-80"
                onClick={() => window.open(fileUrl)}
              >
                <Image className="w-full h-full object-cover" width={1000} height={1000} src={fileUrl} alt="" />
              </div>
            </>
          );
        })}
      </div>
      <RntButton className="w-40 mt-8 self-center" onClick={handleBackClick}>
        Back
      </RntButton>
    </div>
  );
}

export default ClaimFileList;

import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";
import useAiDamageAnalyze from "@/features/aiDamageAnalyze/hooks/useAiDamageAnalyze";
import RntButton from "@/components/common/rntButton";
import { ChangeEvent, FormEvent, useState } from "react";
import { AiDamageAnalyzePhoto, photoTypes } from "@/model/AiDamageAnalyze";
import { fileToBase64 } from "@/pages/api/aiDamageAnalyze/uploadPhoto";
import { uploadFileToIPFS } from "@/utils/pinata";
import { cronoszkEVM } from "viem/chains";
import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";

function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const { t } = useTranslation();
  const [getAiResponseByTripIfExists, handleUploadPhoto, handleCreateCase] = useAiDamageAnalyze()
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState("Grilled");


  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    // const ipfs = await uploadFileToIPFS(photoFile!)
    // if(ipfs.success) {
      // console.log("ipfs",ipfs)
        // headers: {
        //   Accept: "application/json",
        // },
     

    // const photo = await fileToBase64(photoFile!)
    await handleUploadPhoto(1,{"front_side_left_bumper": "https://cdn.riastatic.com/photosnewr/ria/news_common/avto-posle-avarii-prodavat-bitoe-ili-remontirovat__221765-620x0.jpg"})
    // }
  }
 
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log('TARGEEEEER',e.target.value)
    setSelectedType(e.target.value);
  };
  return (
    <>
    <RntButton onClick={async ()=> await handleCreateCase(1)}>Create Case</RntButton>
     <form onSubmit={handleSave}>
      <div>
        <label htmlFor="photoUpload">Загрузите фото:</label>
        <input
          id="photoUpload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <label htmlFor="photoType">Выберите тип фото:</label>
        <select
          id="photoType"
          value={selectedType}
          onChange={handleTypeChange}
          required
        >
          <option value="" disabled>
            Выберите тип
          </option>
          {photoTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button type="submit">Сохранить</button>
      </div>
    </form>
  );

      <PageTitle title={t("profile.title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading}>
          <UserProfileInfo savedProfileSettings={savedProfileSettings} saveProfileSettings={saveProfileSettings} />
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}

export default Profile;

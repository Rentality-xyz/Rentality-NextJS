import { useTranslation } from "react-i18next";
import * as React from "react";
import { useRouter } from "next/router";
import useStartHosting from "../hooks/useStartHosting";
import useFetchInvestments from "../hooks/useFetchInvestments";
import CarEditForm from "@/components/host/carEditForm/carEditForm";
import { emptyHostCarInfo, HostCarInfo } from "@/model/HostCarInfo";
import RntSuspense from "@/components/common/rntSuspense";
import { isEmpty } from "@/utils/string";
import { getIpfsURI } from "@/utils/ipfsUtils";

function StartHostingInvestmentPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { investmentId: investmentIdQuery } = router.query;
  const investmentId = Number((investmentIdQuery as string) ?? "0");
  const { isLoading: isLoadingInvestments, data: investments } = useFetchInvestments();
  const { mutateAsync: startHosting } = useStartHosting();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hostCarInfo, setHostCarInfo] = React.useState<HostCarInfo>(emptyHostCarInfo);

  React.useEffect(() => {
    if (!isEmpty(hostCarInfo.brand)) return;
    if (isLoadingInvestments) return;
    if (!investments) {
      setIsLoading(false);
      return;
    }

    const investment = investments.find((investment) => investment.investment.investmentId === investmentId);
    if (!investment || investment.investment.isCarBought || investment.investment.investment.inProgress) {
      setIsLoading(false);
      return;
    }

    setHostCarInfo({
      ...emptyHostCarInfo,
      brand: investment.investment.investment.car.brand,
      model: investment.investment.investment.car.model,
      releaseYear: investment.investment.investment.car.yearOfProduction,
      images: investment.metadata.images.map((image, index) => ({ url: getIpfsURI(image), isPrimary: index === 0 })),
    });
    setIsLoading(false);
  }, [isLoadingInvestments, investments, hostCarInfo, investmentId]);

  async function handleSaveCar(hostCarInfo: HostCarInfo) {
    return startHosting({
      hostCarInfo: hostCarInfo,
      investId: investmentId,
    });
  }

  return (
    <RntSuspense isLoading={isLoading}>
      {isEmpty(hostCarInfo.brand) && (
        <h1 className="py-8 text-2xl font-bold text-rentality-alert-text">{t("invest.start_hosting_loading_error")}</h1>
      )}
      {!isEmpty(hostCarInfo.brand) && (
        <CarEditForm initValue={hostCarInfo} editMode="startInvestmentCar" saveCarInfo={handleSaveCar} t={t} />
      )}
    </RntSuspense>
  );
}

export default StartHostingInvestmentPageContent;

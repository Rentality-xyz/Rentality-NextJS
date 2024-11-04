import React from "react";
import RntButton from "../../../components/common/rntButton";
import { useTranslation } from "react-i18next";

function SwitchChainDialog({
  handleSwitchChain,
  chainId,
}: {
  handleSwitchChain: (chainId: number) => Promise<void>;
  chainId: number;
}) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center gap-4 md:px-4">
      <h1 className="text-center text-xl font-bold text-rentality-secondary">
        {t("search_page.info.does_not_support_selected_network")}
      </h1>
      <RntButton
        onClick={async () => await handleSwitchChain(chainId)}
        className="mt-2 flex w-full items-center justify-center md:w-48"
      >
        {t("search_page.info.switch_network")}
      </RntButton>
    </section>
  );
}

export default SwitchChainDialog;

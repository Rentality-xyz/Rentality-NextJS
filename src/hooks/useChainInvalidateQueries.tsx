import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEthereum } from "@/contexts/web3/ethereumContext";

export function useChainInvalidateQueries() {
  const qc = useQueryClient();
  const ethereumInfo = useEthereum();
  const prevChainId = useRef<number | null>(null);

  useEffect(() => {
    const chainId = ethereumInfo?.chainId;
    if (!chainId) return;

    const prev = prevChainId.current;
    prevChainId.current = chainId;

    // перший сет chainId — не чіпаємо
    if (prev === null) return;

    // ✅ якщо chain реально змінився — перезапитати дані
    if (prev !== chainId) {
      qc.invalidateQueries();
    }
  }, [ethereumInfo?.chainId, qc]);
}

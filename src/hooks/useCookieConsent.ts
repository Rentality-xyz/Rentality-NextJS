import { useEffect, useState, useCallback } from "react";


export default function useCookieConsent() {
  const [status, setStatus] = useState<Boolean|null>(false);

  useEffect(() => {
    const saved = localStorage.getItem("cookiesAccepted");
    if (saved === "true") setStatus(true);
    else if (saved === "false") setStatus(false);
    else setStatus(null);
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem("cookiesAccepted", "true");
    setStatus(true);
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem("cookiesAccepted", "false");
    setStatus(false);
  }, []);

  return { status, accept, decline };
}

import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: any; //MetaMaskInpageProvider
    __googleMapsCallback__: () => void;
  }
}

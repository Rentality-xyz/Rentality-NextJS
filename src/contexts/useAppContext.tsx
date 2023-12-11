import { createContext, FC, ReactNode, useContext, useState } from "react";
import { BlockchainsEnum } from "@/model/blockchain/BlockchainsEnum";

interface IAppContext {
  isHideBurgerMenu: boolean;
  toggleBurgerMenu: () => void;
  selectedBlockchain: BlockchainsEnum;
  toggleBlockchain: (_selectedBlockchain: BlockchainsEnum) => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isHideBurgerMenu, setIsHideBurgerMenu] = useState(false);
  const [selectedBlockchain, setBlockchain] = useState(BlockchainsEnum.ETHEREUM);

  const toggleBurgerMenu = () => {
    setIsHideBurgerMenu((prev) => !prev);
    const body = document.body;
    if (isHideBurgerMenu) {
      body.classList.remove("max-lg:overflow-hidden");
    } else {
      body.classList.add("max-lg:overflow-hidden");
    }
  };

  const toggleBlockchain = (_selectedBlockchain: BlockchainsEnum) => {
    setBlockchain((prev) => _selectedBlockchain);
  };

  // const getSelectedBlockchainHook = (): IBlockchainFun => {
  //     switch (selectedBlockchain) {
  //         case BlockchainsEnum.ETHEREUM:
  //             return ethereumLikeBlockchain;
  //         case BlockchainsEnum.POLYGON:
  //             return polygonBlockchain;
  //         case BlockchainsEnum.FUSE:
  //             return fuseBlockchain;
  //         default:
  //             throw new Error(`Unsupported blockchain: ${selectedBlockchain}`);
  //     }
  // };

  return (
    <AppContext.Provider value={{ isHideBurgerMenu, toggleBurgerMenu, selectedBlockchain, toggleBlockchain }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

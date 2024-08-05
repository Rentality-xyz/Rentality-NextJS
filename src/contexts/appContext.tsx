import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface IAppContext {
  isHideBurgerMenu: boolean;
  openBurgerMenu: () => void;
  closeBurgerMenu: () => void;
  isHideFilterOnSearchPage: boolean;
  openFilterOnSearchPage: () => void;
  closeFilterOnSearchPage: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isHideBurgerMenu, setIsHideBurgerMenu] = useState(false);
  const [isHideFilterOnSearchPage, setHideFilterOnSearchPage] = useState(false);

  const openBurgerMenu = useCallback(() => {
    setIsHideBurgerMenu(true);
  }, []);

  const closeBurgerMenu = useCallback(() => {
    setIsHideBurgerMenu(false);
  }, []);

  const openFilterOnSearchPage = useCallback(() => {
    setHideFilterOnSearchPage(true);
  }, []);

  const closeFilterOnSearchPage = useCallback(() => {
    setHideFilterOnSearchPage(false);
  }, []);

  const value = useMemo(
    () => ({
      isHideBurgerMenu,
      openBurgerMenu,
      closeBurgerMenu,
      isHideFilterOnSearchPage,
      openFilterOnSearchPage,
      closeFilterOnSearchPage,
    }),
    [
      isHideBurgerMenu,
      openBurgerMenu,
      closeBurgerMenu,
      isHideFilterOnSearchPage,
      openFilterOnSearchPage,
      closeFilterOnSearchPage,
    ]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

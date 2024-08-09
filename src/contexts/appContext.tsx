import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface IAppContext {
  isBurgerMenuShown: boolean;
  openBurgerMenu: () => void;
  closeBurgerMenu: () => void;
  isFilterOnSearchPageShown: boolean;
  openFilterOnSearchPage: () => void;
  closeFilterOnSearchPage: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isBurgerMenuShown, setIsBurgerMenuShown] = useState(false);
  const [isFilterOnSearchPageShown, setIsFilterOnSearchPageShown] = useState(false);

  const openBurgerMenu = useCallback(() => {
    setIsBurgerMenuShown(true);
  }, []);

  const closeBurgerMenu = useCallback(() => {
    setIsBurgerMenuShown(false);
  }, []);

  const openFilterOnSearchPage = useCallback(() => {
    setIsFilterOnSearchPageShown(true);
  }, []);

  const closeFilterOnSearchPage = useCallback(() => {
    setIsFilterOnSearchPageShown(false);
  }, []);

  const value = useMemo(
    () => ({
      isBurgerMenuShown,
      openBurgerMenu,
      closeBurgerMenu,
      isFilterOnSearchPageShown,
      openFilterOnSearchPage,
      closeFilterOnSearchPage,
    }),
    [
      isBurgerMenuShown,
      openBurgerMenu,
      closeBurgerMenu,
      isFilterOnSearchPageShown,
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

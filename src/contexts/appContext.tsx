import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface IAppContext {
  isHideBurgerMenu: boolean;
  toggleBurgerMenu: () => void;
  isHideFilterOnSearchPage: boolean;
  toggleFilterOnSearchPage: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isHideBurgerMenu, setIsHideBurgerMenu] = useState(false);
  const [isHideFilterOnSearchPage, setHideFilterOnSearchPage] = useState(false);

  const toggleBurgerMenu = useCallback(() => {
    setIsHideBurgerMenu((prev) => !prev);
  }, []);

  const toggleFilterOnSearchPage = useCallback(() => {
    setHideFilterOnSearchPage((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isHideBurgerMenu,
      toggleBurgerMenu,
      isHideFilterOnSearchPage,
      toggleFilterOnSearchPage,
    }),
    [isHideBurgerMenu, toggleBurgerMenu, isHideFilterOnSearchPage, toggleFilterOnSearchPage]
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

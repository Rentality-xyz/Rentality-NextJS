import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface IAppContext {
  isBurgerMenuShown: boolean;
  toggleBurgerMenu: () => void;
  isFilterOnSearchPageShown: boolean;
  toggleFilterOnSearchPage: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isBurgerMenuShown, setIsBurgerMenuShown] = useState(false);
  const [isFilterOnSearchPageShown, setIsFilterOnSearchPageShown] = useState(false);

  const toggleBurgerMenu = useCallback(() => {
    setIsBurgerMenuShown((prev) => !prev);
  }, []);

  const toggleFilterOnSearchPage = useCallback(() => {
    setIsFilterOnSearchPageShown((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isBurgerMenuShown,
      toggleBurgerMenu,
      isFilterOnSearchPageShown,
      toggleFilterOnSearchPage,
    }),
    [isBurgerMenuShown, toggleBurgerMenu, isFilterOnSearchPageShown, toggleFilterOnSearchPage]
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

import { createContext, useContext, useState } from "react";

interface IAppContext {
  isHideBurgerMenu: boolean;
  toggleBurgerMenu: () => void;
  isHideFilterOnSearchPage: boolean;
  toggleFilterOnSearchPage: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isHideBurgerMenu, setIsHideBurgerMenu] = useState(false);
  const [isHideFilterOnSearchPage,setHideFilterOnSearchPage] = useState(false);

  const toggleBurgerMenu = () => {
    setIsHideBurgerMenu((prev) => !prev);
    const body = document.body;
    if (isHideBurgerMenu) {
      body.classList.remove("max-lg:overflow-hidden");
    } else {
      body.classList.add("max-lg:overflow-hidden");
    }
  };

  const toggleFilterOnSearchPage = () => {
    setHideFilterOnSearchPage((prev) => !prev);
    const body = document.body;
    if (isHideFilterOnSearchPage) {
      body.classList.remove("overflow-hidden");
    } else {
      body.classList.add("overflow-hidden");
    }
  };

  return <AppContext.Provider value={{ isHideBurgerMenu, toggleBurgerMenu, isHideFilterOnSearchPage, toggleFilterOnSearchPage }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

import { createContext, useContext, useState } from "react";

interface IAppContext {
  isHideBurgerMenu: boolean;
  toggleBurgerMenu: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isHideBurgerMenu, setIsHideBurgerMenu] = useState(false);

  const toggleBurgerMenu = () => {
    setIsHideBurgerMenu((prev) => !prev);
    const body = document.body;
    if (isHideBurgerMenu) {
      body.classList.remove("max-lg:overflow-hidden");
    } else {
      body.classList.add("max-lg:overflow-hidden");
    }
  };

  return <AppContext.Provider value={{ isHideBurgerMenu, toggleBurgerMenu }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

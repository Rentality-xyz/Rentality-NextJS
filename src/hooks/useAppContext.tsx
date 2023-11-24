import {createContext, FC, ReactNode, useContext, useState} from "react";


interface AppContextType {
    isHideBurgerMenu: boolean;
    toggleBurgerMenu: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
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

    return (
        <AppContext.Provider value={{ isHideBurgerMenu, toggleBurgerMenu }}>
            {children}
        </AppContext.Provider>
    );

};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};
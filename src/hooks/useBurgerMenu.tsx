import {createContext, FC, ReactNode, useContext, useState} from "react";


interface BurgerMenuContextType {
    isActiveBurgerMenu: boolean;
    toggleBurgerMenu: () => void;
};

const BurgerMenuContext = createContext<BurgerMenuContextType | undefined>(undefined);

export const BurgerMenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isActiveBurgerMenu, setIsActiveBurgerMenu] = useState(false);

    const toggleBurgerMenu = () => {
        setIsActiveBurgerMenu((prev) => !prev);
        const body = document.body;
        if (isActiveBurgerMenu) {
            body.classList.remove("max-lg:overflow-hidden");
        } else {
            body.classList.add("max-lg:overflow-hidden");
        }
    };

    return (
        <BurgerMenuContext.Provider value={{ isActiveBurgerMenu, toggleBurgerMenu }}>
            {children}
        </BurgerMenuContext.Provider>
    );

};

export const useBurgerMenuContext = () => {
    const context = useContext(BurgerMenuContext);
    if (!context) {
        throw new Error('useBurgerMenuContext must be used within an BurgerMenuProvider');
    }
    return context;
};
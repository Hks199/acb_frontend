import { useState, createContext, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loadingUser, setLoadingUser]= useState(true);
    const [cartCount, setCartCount] = useState(0);

    return (
        <UserContext.Provider value={{user, setUser, isAuth, setIsAuth,  loadingUser, setLoadingUser, cartCount, setCartCount}}>
            {children}
        </UserContext.Provider>
    )
}

const useUserHook = () => {
    const context = useContext(UserContext);
    return context;
}

export default useUserHook;

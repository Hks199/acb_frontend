import { useState, createContext, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loadingUser, setLoadingUser]= useState(true);

    return (
        <UserContext.Provider value={{user, setUser, isAuth, setIsAuth,  loadingUser, setLoadingUser}}>
            {children}
        </UserContext.Provider>
    )
}

const useUserHook = () => {
    const context = useContext(UserContext);
    return context;
}

export default useUserHook;

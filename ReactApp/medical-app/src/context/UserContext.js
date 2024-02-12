import React, { createContext, useContext, useState } from 'react';
import { setCookie, getCookie } from '../utils/cookieUtils';
import { decodeJwt } from '../utils/jwtUtils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [jwt, setJWT] = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(false);



  const setJWTContext = (jwt) => {
    setJWT(jwt);
  };

  const handleLogin = (jwt) => {
    const decodedJwt = decodeJwt(jwt);
    if(decodedJwt != null){
        console.log(decodedJwt);
    }
    setLoggedIn(true);
  };

  const handleLogout = () => {
    // Logic for handling logout
    console.log("SCHIMBAT");
    setLoggedIn(false);
  };

  const setUserCookie = () => {

  }

  return (
    <UserContext.Provider value={{ jwt, isLoggedIn, setJWT: setJWTContext, handleLogin, handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
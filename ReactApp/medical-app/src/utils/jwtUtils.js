import {jwtDecode} from 'jwt-decode';
import { setCookie, getCookie } from '../utils/cookieUtils';

export const decodeJwt = (jwtToken) => {
    try {
      // Decode the JWT token
    //   console.log(jwtToken)
      const decoded = jwtDecode(jwtToken);
      return decoded;
    } catch (error) {
      console.error('Error decoding JWT token:', error.message);
    }
    return null;
  };

export const handleLogin = (jwt) => {
    const decodedJwt = decodeJwt(jwt);
    // console.log(decodedJwt);
    if(decodedJwt != null){
        setCookie('user', jwt, {path: '/'});
        // setCookie('userJWT', {"jwtToken": jwt}, {path: '/', expires: decodeJwt.exp});
        return decodedJwt;
    }
    return null;
  };
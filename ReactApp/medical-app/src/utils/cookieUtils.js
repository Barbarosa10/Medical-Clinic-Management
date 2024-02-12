import Cookies from 'universal-cookie';
import { decodeJwt } from '../utils/jwtUtils';
const cookies = new Cookies();

export const setCookie = (name, value, options) => {
  cookies.set(name, value, options);
};

export const getJWT = (name) => {
    return cookies.get(name);
}
export const getCookie = (name) => {
  const jwt =  cookies.get(name);
  if(jwt != null){
    const decodedJwt = decodeJwt(jwt);
    // console.log(decodedJwt);
    return decodedJwt;
  }
  return null;

};

export const removeCookie = (name) => {
    cookies.remove(name);
  };

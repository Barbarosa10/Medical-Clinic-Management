import React, { useState, useEffect } from 'react';
import '../style/auth.css'; // You can create a CSS file for styling
import { useNavigate} from "react-router-dom";
import axios from "axios"
import { loginRoute, registerRoute } from "../utils/ApiRoute";
import { setCookie, getCookie } from '../utils/cookieUtils';
import { handleLogin } from "../utils/jwtUtils";

const Auth = ({onLogin}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cnp, setCnp] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // For toggling between login and register forms
  const navigate = useNavigate();
  
  
  useEffect(() => {
    console.log(getCookie('user'));
    if (getCookie('user') != undefined) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add your authentication logic here
    if (isRegistering) {
        // Handle registration
        try{
            const response = await axios.post(registerRoute, {
                username, 
                password,
                firstname,
                lastname,
                email,
                phone,
                birth_date: birthDate,
                is_active: 1,
                cnp
            }
            );
            console.log(response);

            if(response){
                if(response.status == 200){
                    // setIsRegistering(!isRegistering)
                }
            }
        }catch(error){
            console.error(error.code);
        }
        setUsername('');
        setEmail('');
        setFirstname('');
        setLastname('');
        setPhone('');
        setBirthDate('');
        setCnp('');
    } else {
      // Handle login
    }
        try{
            const response = await axios.post(loginRoute, {
                username, 
                password
            }
            );
            console.log(response);

            if(response){
                if(response.status == 200){
                    if(handleLogin(response.data.jwt_token)){
                        navigate('/');
                    }
                }
            }
        }catch(error){
            console.error(error.code);
        }
        // Clear form fields
        setUsername('');
        setPassword('');

    
  };

  return (
    <div className="auth-form-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {isRegistering && (
            <>
                <label>Firstname:</label>
                <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                <label>Lastname:</label>
                <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Phone:</label>
                <input type="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <label>Birth Date:</label>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} pattern="\d{4}-\d{2}-\d{2}" required />
                <label>CNP (13 characters):</label>
                <input type="text" value={cnp} onChange={(e) => setCnp(e.target.value)} maxLength={13} pattern="\d{13}" title="CNP must be 13 digits" required />

            </>
        )}

        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>

      <p onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
      </p>
    </div>
  );
};

export default Auth;

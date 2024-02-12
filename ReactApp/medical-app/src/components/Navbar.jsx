import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import '../style/navbar.css'
import { useNavigate} from "react-router-dom";
import { removeCookie, getCookie } from '../utils/cookieUtils';
import { decodeJwt } from "../utils/jwtUtils";

const Navbar = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');

    const logout = () => {
        // Add logic for logging out
        console.log('Logout clicked');
        removeCookie('user');
        navigate('/auth');
    };

    useEffect(() => {
        if(getCookie('user') == undefined){
            navigate('/auth');
        }
        else{
            const role = getCookie('user').role;
            console.log(role);
            if(role == 'PATIENT'){
    
            }
            else if(role == 'ADMIN'){
    
            }
            else if(role == 'DOCTOR'){
    
            }
        }

    }, []);

    const {pathname} = useLocation();
    // console.log(pathname);

    return (
        <>
            {(getCookie('user')) &&<nav className="navbar">
                <div className="left-side">
                    <Link className={(pathname === '/home') ? 'active' : ''} to="/home" >Home</Link>
                    {(getCookie('user').role == 'ADMIN' || getCookie('user').role == 'DOCTOR') && <Link className={(pathname === '/patients') ? 'active' : ''} to="/patients">Patients</Link>}
                    {getCookie('user').role == 'ADMIN' && <Link className={(pathname === '/doctors') ? 'active' : ''} to="/doctors">Doctors</Link>}
                    {getCookie('user').role == 'ADMIN' && <Link className={(pathname === '/admin') ? 'active' : ''} to="/admin">Admin</Link>}
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR')&&<Link className={(pathname === '/appointments') ? 'active' : ''} to="/appointments">Appointments</Link>}
                    {/* {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') && <Link className={(pathname === '/examinations') ? 'active' : ''} to="/examinations">Examinations</Link>} */}
                    {getCookie('user').role == 'ADMIN' && <Link className={(pathname === '/register') ? 'active' : ''} to="/register">Register</Link>}

                </div>
                <div className="right-side">
                    <button onClick={logout}>Log Out</button>
                </div>
            </nav>}
        </>
    );
};

export default Navbar;

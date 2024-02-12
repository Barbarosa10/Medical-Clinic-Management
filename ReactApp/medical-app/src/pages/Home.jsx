import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {useUser} from "../context/UserContext";
import { useNavigate} from "react-router-dom";
import { getCookie, getJWT } from '../utils/cookieUtils';
import { host } from "../utils/ApiRoute";
import axios from "axios";
import '../style/home.css'

const Home = () => {
    const {jwt, isLoggedIn} = useUser();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [isActive, setIsActive] = useState(1);
    const [selectedSpecialization, setSelectedSpecialization] = useState('DERMATOLOGIE');

    const handleSelectChange = (event) => {
        setSelectedSpecialization(event.target.value);
    };
    // const [active, setActive] = useState('');
    
    useEffect(() => {
        if(getCookie('user') == undefined){
            navigate('/auth');
        }
        else{
            const getUserInfo = async() => {
                let url = "";
                console.log(getCookie('user').role);
    
                if(getCookie('user').role == 'PATIENT'){
                    url = `${host}/api/medical_office/patients/${getCookie('user').role_id}`
                }else if(getCookie('user').role == 'DOCTOR'){
                    url = `${host}/api/medical_office/physicians/${getCookie('user').role_id}`
                }
    
                if(url != ""){
                    try{
                        console.log(url);
                        console.log(getCookie('user').jwtToken);
                        const response = await axios.get(url, {
                            headers: {
                                "Authorization": "Bearer " + getJWT('user')
                            }
                        });
                        console.log(response);
            
                        if(response){
                            if(response.status == 200){
                                setFirstname(response.data.firstname);
                                setLastname(response.data.lastname);
                                setEmail(response.data.email);
                                setFirstname(response.data.firstname);
                                setPhone(response.data.phone);
                                setBirthDate(response.data.birth_date);
                                setIsActive(response.data.is_active);
                                console.log(response.data.specialization);
                                setSelectedSpecialization(response.data.specialization);
                            }
                        }
                    }catch(error){
                        console.error(error.code);
                    }
                }
                //set username from cookie
                setUsername(getCookie('user').name);
    
            }
            getUserInfo();
        }
        

    }, []);

    const handleSave = async(e) => {
        e.preventDefault(); // Prevent the default form submission
    
        let url = "";
        let body = {};
        console.log(getCookie('user').role);

        if(getCookie('user').role == 'PATIENT'){
            url = `${host}/api/medical_office/patients/${getCookie('user').role_id}`;
            body = {
                firstname, lastname, email, phone, birth_date: birthDate, is_active: isActive, id_user: getCookie('user').sub
            }
        }else if(getCookie('user').role == 'DOCTOR'){
            url = `${host}/api/medical_office/physicians/${getCookie('user').role_id}`;
            body = {
                firstname, lastname, email, phone, specialization: selectedSpecialization, id_user: getCookie('user').sub
            }
        }

        if(url != ""){
            try{
                console.log(url);
                console.log(getCookie('user').jwtToken);
                const response = await axios.put(url, body,
                    {
                    headers: {
                        "Authorization": "Bearer " + getJWT('user')
                    }
                });
                console.log(response);
    
                // if(response){
                //     if(response.status == 200){
                //         setEditableRowIndex(null);
                //     }
                // }
            }catch(error){
                console.error(error.code);
            }
        }
      };

    return (
        <>
            {getCookie('user')&&<Navbar/>}         
            {getCookie('user')&&<div className="home-container">
                <h2>Welcome, {getCookie('user').name}!</h2> 
                <br /><br />
                <form onSubmit={handleSave} method="post">
                    <h2>User Data</h2>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" value={username} readOnly required/>
                    
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<label htmlFor="firstname">Firstname:</label>}
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<input type="text" id="firstname" name="firstname" value={firstname} readOnly required/>}
                    
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<label htmlFor="lastname">Lastname:</label>}
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<input type="text" id="lastname" name="lastname" value={lastname} readOnly required/>}

                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<label htmlFor="email">Email:</label>}
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}  required/>}

                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<label htmlFor="phone">Phone:</label>}
                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') &&<input type="phone" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required/>}

                    {getCookie('user').role == "PATIENT" && <label htmlFor="birthDate">Birth Date:</label>}
                    {getCookie('user').role == "PATIENT" && <input type="date" id="birthDate" name="birthDate" value={birthDate} readOnly required/>}

                    {getCookie('user').role == "DOCTOR" && <label htmlFor="dropdown">Select a specialization:</label>}
                    {getCookie('user').role == "DOCTOR" &&<select id="dropdown" value={selectedSpecialization} onChange={handleSelectChange}>
                        <option value="CARDIOLOGIE">CARDIOLOGIE</option>
                        <option value="DERMATOLOGIE">DERMATOLOGIE</option>
                        <option value="ORTOPEDIE">ORTOPEDIE</option>
                        <option value="ORL">ORL</option>
                        <option value="NEUROLOGIE">NEUROLOGIE</option>
                    </select>}

                    <label htmlFor="role">Role:</label>
                    <input type="text" id="role" name="role" value={getCookie('user').role} readOnly required/>

                    {/* <label htmlFor="isActive">Active:</label>
                    <input type="text" id="iActive" name="isActive" value={active} onChange={(e) => setActive(e.target.value)} required/> */}

                    {(getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') && <button type="submit">Save Changes</button>}
                </form>
            
            </div>}
        </>

    );
};

export default Home;
import React, { useState } from 'react';
import { getCookie, getJWT } from '../utils/cookieUtils';
import { host } from "../utils/ApiRoute";
import axios from "axios";
import Navbar from '../components/Navbar';

const Register = () => {
  // State for doctor form
  const [doctorFormData, setDoctorFormData] = useState({
    lastname: '',
    firstname: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
    // other doctor-related fields
  });

  // State for admin form
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    email: '',
    password: '',
    // other admin-related fields
  });

  const registerUsers = async(type) => {
    let url = "";
    let body;
    if(type == 'DOCTOR'){
        url = `${host}/api/register_doctor`;
        body = doctorFormData;
    }else if(getCookie('user').role == 'ADMIN'){
        url = `${host}/api/register_admin`;
        body = adminFormData;
    }

    if(url != ""){
        try{
            console.log(url);
            console.log(getCookie('user'));
            console.log(body);
            const response = await axios.post(url, body,
            {
                headers: {
                    "Authorization": "Bearer " + getJWT('user')
                }
            });
            console.log(response);

        }catch(error){
            console.error(error.code);
        }
    }

}

  // Handle doctor form submission
  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    // Perform logic for adding a doctor
    console.log('Adding doctor:', doctorFormData);

    registerUsers('DOCTOR');

    // Reset form fields or perform other actions as needed
    setDoctorFormData({
        lastname: '',
        firstname: '',
        email: '',
        phone: '',
        specialization: '',
        password: '',
    });
  };



  // Handle admin form submission
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    // Perform logic for adding an admin
    console.log('Adding admin:', adminFormData);

    registerUsers('ADMIN');


    // Reset form fields or perform other actions as needed
    setAdminFormData({
      username: '',
      email: '',
      password: '',
    });

  };

  // Handle input changes for doctor form
  const handleDoctorInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle input changes for admin form
  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
        {getCookie('user') && (getCookie('user').role == 'ADMIN') && <Navbar/>}       
        {getCookie('user') && (getCookie('user').role == 'ADMIN') ? 
        <div className="home-container">
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {/* Doctor Form */}
            <form onSubmit={handleDoctorSubmit}>
                <h2>Add Doctor</h2>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={doctorFormData.username}
                        onChange={handleDoctorInputChange}
                        required
                    />
                </label>
                <label>
                    Lastname:
                    <input
                        type="text"
                        name="lastname"
                        value={doctorFormData.lastname}
                        onChange={handleDoctorInputChange}
                        required
                    />
                </label>
                <label>
                    Firstname:
                    <input
                        type="text"
                        name="firstname"
                        value={doctorFormData.firstname}
                        onChange={handleDoctorInputChange}
                        required
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={doctorFormData.email}
                        onChange={handleDoctorInputChange}
                        required
                    />
                </label>
                <label>
                    Phone:
                    <input
                        type="text"
                        name="phone"
                        value={doctorFormData.phone}
                        onChange={handleDoctorInputChange}
                        required
                    />
                </label>
                <label>
                    Specialty:
                    <select id="dropdown" name="specialization" value={doctorFormData.specialization}  onChange={handleDoctorInputChange}>
                        <option value="CARDIOLOGIE">CARDIOLOGIE</option>
                        <option value="DERMATOLOGIE">DERMATOLOGIE</option>
                        <option value="ORTOPEDIE">ORTOPEDIE</option>
                        <option value="ORL">ORL</option>
                        <option value="NEUROLOGIE">NEUROLOGIE</option>
                    </select>
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={doctorFormData.password}
                        onChange={handleDoctorInputChange}
                        required
                    />
                </label>
                {/* Add more doctor-related fields as needed */}
                <button type="submit">Add Doctor</button>
            </form>

            {/* Admin Form */}
            <form onSubmit={handleAdminSubmit}>
                <h2>Add Admin</h2>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={adminFormData.username}
                        onChange={handleAdminInputChange}
                        required
                    />
                    </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={adminFormData.email}
                        onChange={handleAdminInputChange}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={adminFormData.password}
                        onChange={handleAdminInputChange}
                        required
                    />
                </label>
                {/* Add more admin-related fields as needed */}
                <button type="submit">Add Admin</button>
            </form>
            </div>
        </div> : (<p>Not authorized!!!</p>)}
    </>
  );
};

export default Register;

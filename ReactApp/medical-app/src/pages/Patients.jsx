import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {useUser} from "../context/UserContext";
import { useNavigate} from "react-router-dom";
import { getCookie, getJWT } from '../utils/cookieUtils';
import { host } from "../utils/ApiRoute";
import axios from "axios";
import '../style/patients.css'

const Patients = () => {
    const {jwt, isLoggedIn} = useUser();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [cnpPatient, setCnpPatient] = useState('');
    const [idDoctor, setIdDoctor] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('');

    const [data, setData] = useState([]);
    const [editableRowIndex, setEditableRowIndex] = useState(null);


    // const [active, setActive] = useState('');
    
    useEffect(() => {
        if(getCookie('user') == undefined){
            navigate('/auth');
        }
        else{
            const getPatients = async() => {
                let url = "";
                console.log(getCookie('user').role);
    
                if(getCookie('user').role == 'DOCTOR'){
                    url = `${host}/api/medical_office/patients?is_active=true`
                }
                else if(getCookie('user').role == 'ADMIN'){
                    url = `${host}/api/medical_office/patients`
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
                                const initialData = response.data;
                                setData(initialData);
    
    
                            }
                        }
                    }catch(error){
                        console.error(error.code);
                    }
                }
                //set username from cookie
    
            }
            getPatients();
        }


        
    }, []);
    
    const savePatient = async(row) => {
        let url = "";
        console.log(getCookie('user').role);

        if(getCookie('user').role == 'ADMIN'){
            url = `${host}/api/medical_office/patients/${row.cnp}`
        }

        if(url != ""){
            try{
                console.log(url);
                console.log(getCookie('user').jwtToken);
                const response = await axios.put(url,
                    {
                        firstname: row.firstname, lastname: row.lastname, email: row.email, phone: row.phone, birth_date: row.birth_date, is_active: row.is_active, id_user: row.id_user
                    },
                    {
                    headers: {
                        "Authorization": "Bearer " + getJWT('user')
                    }
                });
                console.log(response);
    
                if(response){
                    if(response.status == 200){
                        setEditableRowIndex(null);
                    }
                }
            }catch(error){
                console.error(error.code);
            }
        }
    }

    const handleEdit = (index) => {
        setEditableRowIndex(index);
      };
    
      const handleSave = (row) => {
        console.log(row);
        savePatient(row);
      };
    
      const handleInputChange = (index, columnName, value) => {
        const newData = data.map((row) =>
          row.id_user === index ? { ...row, [columnName]: value } : row
        );
        setData(newData);
      };

      const handleDelete = async (id) => {
        console.log(id);
        try {
            // Make a request to delete the row with the given ID
            const response = await axios.delete(`${host}/api/medical_office/patients/${id}`, {
                headers: {
                    "Authorization": "Bearer " + getJWT('user')
                }
            });

            if (response && (response.status === 200 || response.status === 204)) {
                // Update the state to reflect the deleted row
                const updatedData = data.filter(row => row.cnp != id);
                console.log()
                setData(updatedData);
            }
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    };

    return (
        <>
            {getCookie('user') && (getCookie('user').role == 'ADMIN' || getCookie('user').role == 'DOCTOR') &&<Navbar/>}    
            {getCookie('user') && (getCookie('user').role == 'ADMIN' || getCookie('user').role == 'DOCTOR') ? <div className="home-container">
                <div>
                    <table style={{ margin: 'auto' }}>
                        <thead  style={{backgroundColor: '#000000', color: '#ffffff'}}>
                            <tr>
                                <th>ID</th>
                                <th>CNP</th>
                                <th>Lastname</th>
                                <th>Firstname</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Birth Date</th>
                                {(getCookie('user').role == 'ADMIN') && <th>Active</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={row.id_user} style={{ backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}>
                                <td>{row.id_user}</td>
                                <td>{row.cnp}</td>
                                {(getCookie('user').role == 'DOCTOR') &&<td>{row.lastname}</td>}
                                {(getCookie('user').role == 'DOCTOR') &&<td>{row.firstname}</td>}
                                {(getCookie('user').role == 'DOCTOR') &&<td>{row.email}</td>}
                                {(getCookie('user').role == 'DOCTOR') &&<td>{row.phone}</td>}
                                {(getCookie('user').role == 'DOCTOR') &&<td>{row.birth_date}</td>}

                                {(getCookie('user').role == 'ADMIN') &&<td>
                                    {editableRowIndex === row.id_user ? (
                                        <input
                                        type="text"
                                        value={row.lastname}
                                        onChange={(e) => handleInputChange(row.id_user, 'lastname', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.lastname
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td>
                                    {editableRowIndex === row.id_user ? (
                                        <input
                                        type="text"
                                        value={row.firstname}
                                        onChange={(e) => handleInputChange(row.id_user, 'firstname', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.firstname
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td>
                                    {editableRowIndex === row.id_user ? (
                                        <input
                                        type="email"
                                        value={row.email}
                                        onChange={(e) => handleInputChange(row.id_user, 'email', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.email
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td>
                                    {editableRowIndex === row.id_user ? (
                                        <input
                                        type="text"
                                        value={row.phone}
                                        onChange={(e) => handleInputChange(row.id_user, 'phone', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.phone
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td>
                                    {editableRowIndex === row.id_user ? (
                                        <input
                                        type="date"
                                        value={row.birth_date}
                                        onChange={(e) => handleInputChange(row.id_user, 'birth_date', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.birth_date
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td>
                                    {editableRowIndex === row.id_user ? (
                                        <input
                                        type="checkbox"
                                        checked={row.is_active}
                                        onChange={(e) => handleInputChange(row.id_user, 'is_active', e.target.checked)}
                                        style={{ width: '20px', height: '20px', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.is_active ? 'Yes' : 'No'
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td style={{backgroundColor: 'wheat'}} >
                                    {editableRowIndex === row.id_user ? (
                                    <button onClick={() => handleSave(row)}>Save</button>
                                    ) : (
                                    <button onClick={() => handleEdit(row.id_user)}>Edit</button>
                                    )}
                                </td>}
                                {(getCookie('user').role == 'ADMIN') &&<td style={{backgroundColor: 'wheat'}}>
                                    <button onClick={() => handleDelete(row.cnp)}>Delete</button>
                                </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> : (<p>Not authorized!!!</p>)}
        </>

    );
};

export default Patients;
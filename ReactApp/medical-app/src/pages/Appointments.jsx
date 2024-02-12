import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {useUser} from "../context/UserContext";
import { useNavigate} from "react-router-dom";
import { getCookie, getJWT } from '../utils/cookieUtils';
import { host } from "../utils/ApiRoute";
import axios from "axios";
import '../style/appointments.css'

const Appointments = () => {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [date, setDate] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [editableRowIndex, setEditableRowIndex] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState();
    const [selectedDoctorName, setSelectedDoctorName] = useState();
    const initialValue = 0;


    // const [active, setActive] = useState('');
    
    useEffect(() => {
        if(getCookie('user') == undefined){
            navigate('/auth');
        }
        else{
            const getAppointments = async() => {
                let url = "";
                console.log(getCookie('user').role);
    
                if(getCookie('user').role == 'PATIENT'){
                    url = `${host}/api/medical_office/patients/${getCookie('user').role_id}/physicians`
                }else if(getCookie('user').role == 'DOCTOR'){
                    url = `${host}/api/medical_office/physicians/${getCookie('user').role_id}/patients`
                }
                else if(getCookie('user').role == 'ADMIN'){
                    url = `${host}/api/medical_office/appointments`
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

            const getDoctors = async() => {
                let url = "";
                console.log(getCookie('user').role);
    
                if(getCookie('user').role == 'PATIENT'){
                    url = `${host}/api/medical_office/physicians`
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
                                console.log(initialData);
                                if(initialData[0] && initialData[0].id){
                                    setSelectedDoctor(initialData[0].id)
                                    setSelectedDoctorName(initialData[0].lastname +" "+initialData[0].firstname)
                                }
                                    
                                
                                setDoctors(initialData);
    
    
                            }
                        }
                    }catch(error){
                        console.error(error.code);
                    }
                }
                //set username from cookie
    
            }

            getAppointments();
            if(getCookie('user').role == 'PATIENT'){
                getDoctors();

            }

        }

        
    }, []);
    
    const saveApointment = async(row) => {
        let url = "";
        console.log(getCookie('user').role);

        if(getCookie('user').role == 'PATIENT'){
            url = `${host}/api/medical_office/patients/${row.cnp_patient}/physicians/${row.id_doctor}?date=${row.date}`
        }else if(getCookie('user').role == 'DOCTOR'){
            url = `${host}/api/medical_office/physicians/${row.id_doctor}/patients/${row.cnp_patient}?date=${row.date}`
        }

        if(url != ""){
            try{
                console.log(url);
                console.log(getCookie('user').jwtToken);
                const response = await axios.put(url,
                    {
                        cnp_patient: row.cnp_patient,
                        id_doctor: row.id_doctor,
                        date: row.date,
                        status: row.status
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

        saveApointment(row);
      };
      const handleCancel = () => {
        setEditableRowIndex(null);
      }
    
      const handleInputChange = (index, columnName, value) => {
        const newData = data.map((row, i) =>
          i === index ? { ...row, [columnName]: value } : row
        );
        setData(newData);
      };

      const [isAdding, setIsAdding] = useState(false);
      const [newAppointmentData, setNewAppointmentData] = useState({
          cnp_patient: '',
          id_doctor: '',
          date: '',
          status: 'NEPREZENTAT'
      });
  
      const handleAdd = () => {
          // Set isAdding to true to show the form
          setIsAdding(true);
      };
  
      const addAppointment = async(newAppointment) => {
        let url = "";
        console.log(getCookie('user').role);

        if(getCookie('user').role == 'PATIENT'){
            url = `${host}/api/medical_office/appointments`
        }

        if(url != ""){
            try{
                console.log(url);
                console.log(getCookie('user').jwtToken);
                const response = await axios.put(url, {
                    cnp_patient: getCookie('user').role_id,
                    id_doctor: selectedDoctor,
                    date: date,
                    status: 'NEPREZENTAT'
                    },
                    {
                    headers: {
                        "Authorization": "Bearer " + getJWT('user')
                    }
                });
                console.log(response);
    
                if(response){
                    if(response.status == 200){
                        console.log(newAppointment);
                        setData([...data, newAppointment]);
  
                        // Reset isAdding to false to hide the form
                        setIsAdding(false);
                    }
                }
            }catch(error){
                console.error(error.code);
            }
        }
    }

      const handleAddConfirm = () => {
          // Perform validation and add appointment logic here
          // For simplicity, let's assume you have input values in state
          if(getCookie('user').role == 'PATIENT'){
            const newAppointment = {
                cnp_patient: getCookie('user').role_id,
                id_doctor: selectedDoctor,
                date: date,
                status: 'NEPREZENTAT',
                doctor_name: selectedDoctorName
            };
            addAppointment(newAppointment);
          }

  
          // Update the data state with the new appointment

      };
  
      const handleAddCancel = () => {
          // Reset isAdding to false to hide the form
          setIsAdding(false);
      };
  
      const handleInputAppointmentChange = (e) => {
        setDate(e.target.value);
      };
      const handleSelectedDoctor = (event) => {
        setSelectedDoctor(event.target.value);
        setSelectedDoctorName(event.target.options[event.target.selectedIndex].getAttribute("name"));
    };
    const handleRowClick = (row) => {
        // Navigate to a new page with the selected data
        navigate('/examinations', { state: { id_doctor: row.id_doctor, cnp_patient: row.cnp_patient, date: row.date } });
      };

    return (
        <>
            {(getCookie('user') && getCookie('user').role != 'ADMIN') &&<Navbar/>}       
            {(getCookie('user') && getCookie('user').role != 'ADMIN') &&<div className="home-container">
            {isAdding && (
                <table>
                    <tbody>
                        <tr key="addAppointment">
                            {(getCookie('user').role === 'DOCTOR') && <td></td>}
                            <td>
                                Doctor
                                <select
                                    id="dropdown"
                                    name="id_doctor"
                                    value={selectedDoctor}
                                    onChange={handleSelectedDoctor}
                                >
                                    {doctors.map((row, index) => (
                                        <option key={row.id} value={row.id} name={row.lastname + " " + row.firstname} >{row.lastname} {row.firstname}</option>
                                    ))}
                                </select>
                            </td>
                            {(getCookie('user').role === 'PATIENT') && <td></td>}
                            <td>
                                Date
                                <input
                                    type="date"
                                    name="date"
                                    value={date}
                                    onChange={handleInputAppointmentChange}
                                />
                            </td>
                            <td>
                                <button onClick={handleAddConfirm}>Save</button>
                                <button onClick={handleAddCancel}>Cancel</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
                <div>
                    <table style={{ margin: 'auto' }}>
                        <thead  style={{backgroundColor: '#000000', color: '#ffffff'}} >
                            <tr>
                                <th>ID</th>
                                <th>CNP Patient</th>
                                {(getCookie('user').role == 'DOCTOR')&& <th>Patient Name</th>}
                                <th>ID Doctor</th>
                                {(getCookie('user').role == 'PATIENT')&& <th>Doctor Name</th>}
                                <th>Date</th>
                                <th>Status</th>
                                {(getCookie('user').role === 'PATIENT')&&<th><button onClick={() => handleAdd()}>Add</button></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#45a049' : 'white', cursor: editableRowIndex !== index ? 'pointer' : 'default'}}>
                                    <td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>{index}</td>
                                    <td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>{row.cnp_patient}</td>
                                    {(getCookie('user').role == 'DOCTOR')&&<td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>{row.patient_name}</td>}
                                    <td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>{row.id_doctor}</td>
                                    {(getCookie('user').role == 'PATIENT')&&<td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>{row.doctor_name}</td>}
                                    <td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>{row.date}</td>
                                    <td onClick={() => (editableRowIndex !== index ? handleRowClick(row) : null)}>
                                        {editableRowIndex === index ? (
                                        <select id="dropdown" value={row.status} onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}>
                                            <option value="ONORATA">ONORATA</option>
                                            <option value="NEPREZENTAT">NEPREZENTAT</option>
                                            <option value="ANULATA">ANULATA</option>
                                        </select>
                                        ) : (
                                        row.status
                                        )}
                                    </td>
                                    <td style={{backgroundColor: 'wheat'}} >
                                        {editableRowIndex === index ? (
                                        <div>
                                            <button onClick={() => handleSave(row)}>Save</button>
                                            <button onClick={() => handleCancel()}>Cancel</button>
                                        </div>
                                        ) : (
                                        <button onClick={() => handleEdit(index)}>Edit</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>}


        </>

    );
};

export default Appointments;
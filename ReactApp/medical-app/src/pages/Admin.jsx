import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate} from "react-router-dom";
import { getCookie, getJWT } from '../utils/cookieUtils';
import { host } from "../utils/ApiRoute";
import axios from "axios";
import '../style/patients.css'

const Admin = () => {

    const navigate = useNavigate();
    const [data, setData] = useState([]);
    
    useEffect(() => {
        if(getCookie('user') == undefined){
            navigate('/auth');
        }
        else{
            const getAdmins = async() => {
                let url = "";
                console.log(getCookie('user').role);
    
    
                if(getCookie('user').role == 'ADMIN'){
                    url = `${host}/api/admins`
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
                                const initialData = response.data.response.filter(row => row[0] != getCookie('user').sub);
                                console.log(initialData);
                                setData(initialData);
    
    
                            }
                        }
                    }catch(error){
                        console.error(error.code);
                    }
                }   
            }
            getAdmins();
        }


        
    }, []);


    const handleDelete = async (id) => {
        try {
            // Make a request to delete the row with the given ID
            const response = await axios.delete(`${host}/api/delete/${id}`, {
                headers: {
                    "Authorization": "Bearer " + getJWT('user')
                }
            });

            if (response && response.status === 200) {
                // Update the state to reflect the deleted row
                const updatedData = data.filter(row => row[0] !== id);
                setData(updatedData);
            }
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    };

    return (
        <>
           {getCookie('user') && (getCookie('user').role == 'ADMIN') && <Navbar/>}       
           {getCookie('user') && (getCookie('user').role == 'ADMIN') ?<div className="home-container">
                <div>
                    <table style={{ margin: 'auto' }}>
                        <thead  style={{backgroundColor: '#000000', color: '#ffffff'}}>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={row[0]} style={{ backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}>
                                    <td>{row[0]}</td>
                                    <td>{row[1]}</td>
                                    <td>{row[2]}</td>
                                    <td style={{backgroundColor: 'wheat'}}>
                                    <button onClick={() => handleDelete(row[0])}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> : (<p>Not authorized!!!</p>)}
        </>

    );
};

export default Admin;
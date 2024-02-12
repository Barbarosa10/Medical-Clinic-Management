import React, { useState, useEffect } from 'react';
import '../style/examinations.css'; // You can create a CSS file for styling
import { useNavigate, useLocation} from "react-router-dom";
import axios from "axios"
import { loginRoute, registerRoute } from "../utils/ApiRoute";
import { getCookie, getJWT } from '../utils/cookieUtils';
import { handleLogin } from "../utils/jwtUtils";
import { host } from "../utils/ApiRoute";
import { findRenderedComponentWithType } from 'react-dom/test-utils';

const Examinations = () => {
    const { state } = useLocation();
    const [editableRowIndex, setEditableRowIndex] = useState(null);
    const [consultatieID, setConsultatieID] = useState();
    const [diagnostic, setDiagnostic] = useState();
    const [methodType, setMethodType] = useState("POST");
    const [investigatii, setInvestigatii] = useState([]);
    const [denumire, setDenumire] = useState();
    const [durata, setDurata] = useState(0);
    const [rezultat, setRezultat] = useState();
    const [isAdding, setIsAdding] = useState(false);

    // Access parameters from state
    const idDoctor = state.id_doctor;
    const cnpPatient = state.cnp_patient;
    const date = state.date
    const navigate = useNavigate();
  
  
  useEffect(() => {
    if(getCookie('user') == undefined){
        navigate('/auth');
    }
    else{
        const getConsultatie = async() => {
            let url = "";
            console.log(getCookie('user').role);

            url = `${host}/api/medical_office/consultatii?id_doctor=${idDoctor}&cnp_patient=${cnpPatient}&date=${date}`

            if(url != ""){
                try{
                    console.log(url);
                    const response = await axios.get(url, {
                        headers: {
                            "Authorization": "Bearer " + getJWT('user')
                        }
                    });
                    console.log(response);
        
                    if(response){
                        if(response.status == 200 || response.status == 201){
                            setMethodType("PUT");
                            setDiagnostic(response.data.diagnostic);
                            setConsultatieID(response.data._id);
                            if(response.data.investigatii == null)
                                setInvestigatii([])
                            else
                                setInvestigatii(response.data.investigatii)
                            const initialData = response.data;
                            // setData(initialData);
                        }
                        else if(response.status == 404){
                            setMethodType("POST");
                        }
                    }
                }catch(error){
                    console.error(error.code);
                }
            }
            //set username from cookie

        }
        getConsultatie();
    }


    
}, []);

  const saveDiagnostic = async(e) => {
    e.preventDefault();
    console.log(diagnostic);
    
    let url = "";
    console.log(getCookie('user').role);

    if(getCookie('user').role == 'DOCTOR'){
        if(methodType == "POST")
            url = `${host}/api/medical_office/consultatii`;
        else
            url = `${host}/api/medical_office/consultatii/${consultatieID}`;
    }


    if(url != ""){
        try{
            console.log(url);
            console.log(getJWT('user'));
            console.log(methodType);
            if(methodType == "PUT"){
                const response = await axios.put(url,
                    {
                        id_doctor: idDoctor,
                        cnp_patient: cnpPatient,
                        date: date,
                        diagnostic: diagnostic,
                        investigatii: []
                    },
                    {
                    headers: {
                        "Authorization": "Bearer " + getJWT('user')
                    }
                });
                console.log(response);
    
                if(response){
                    if(response.status == 200){
                        console.log(response.data)
                        // setEditableRowIndex(null);
                    }
                }
            }
            else{
                const response = await axios.post(url,
                    {
                        id_doctor: idDoctor,
                        cnp_patient: cnpPatient,
                        date: date,
                        diagnostic: diagnostic
                    },
                    {
                    headers: {
                        "Authorization": "Bearer " + getJWT('user')
                    }
                });
                console.log(response);
    
                if(response){
                    if(response.status == 201){
                        setMethodType("PUT");
                        setConsultatieID(response.data._id);
                        console.log(response.data);
                        // setEditableRowIndex(null);
                    }
                }
            }

        }catch(error){
            console.error(error.code);
        }
    }
    
  };

  const addInvestigatie = async(newInvestigatie) => {
    let url = "";
    console.log(getCookie('user').role);

    url = `${host}/api/medical_office/consultatii/${consultatieID}/investigatii`

    if(url != ""){
        try{
            console.log(url);
            console.log(getCookie('user').jwtToken);
            const response = await axios.put(url, newInvestigatie,
                {
                headers: {
                    "Authorization": "Bearer " + getJWT('user')
                }
            });
            console.log(response);

            if(response){
                if(response.status == 201){
                    console.log(newInvestigatie);
                    setInvestigatii([...investigatii, {id: response.data.investigatii[response.data.investigatii.length-1].id, ...newInvestigatie}]);

                    // Reset isAdding to false to hide the form
                    setIsAdding(false);
                }
            }
        }catch(error){
            console.error(error.code);
        }
    }
}
    const handleAdd = () => {
        // Set isAdding to true to show the form
        setIsAdding(true);
    };

  const handleAddConfirm = () => {

    if(getCookie('user').role == 'DOCTOR'){
      const newInvestigatie = {
          denumire: denumire,
          durata: durata,
          rezultat: rezultat
      };
      addInvestigatie(newInvestigatie);
    }

};

const saveInvestigatie = async(row) => {
    let url = "";
    console.log(getCookie('user').role);
    console.log(row);
    url = `${host}/api/medical_office/consultatii/${consultatieID}/investigatii?investigatie_id=${row.id}`

    if(url != ""){
        try{
            console.log(url);
            console.log(getCookie('user').jwtToken);
            const response = await axios.put(url,
                {
                    denumire: row.denumire,
                    durata: row.durata,
                    rezultat: row.rezultat
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
    const handleAddCancel = () => {
        // Reset isAdding to false to hide the form
        setIsAdding(false);
    };

    const handleInputDenumireChange = (e) => {
        setDenumire(e.target.value);    
    };
    const handleInputDurataChange = (e) => {
        setDurata(e.target.value);    
    };
    const handleInputRezultatChange = (e) => {
        setRezultat(e.target.value);    
    };
    const handleSelectDiagnostic = (e) => {
        setDiagnostic(e.target.value); 
    };

    const handleInputChange = (index, columnName, value) => {
        const newInvestigatii = investigatii.map((row) =>
          row.id === index ? { ...row, [columnName]: value } : row
        );
        setInvestigatii(newInvestigatii);
      };

      const handleEdit = (id) => {
        setEditableRowIndex(id);
      };
    
      const handleSave = (row) => {
        console.log(row);     

        saveInvestigatie(row);
      };
      const handleCancel = () => {
        setEditableRowIndex(null);
      }
  return (
    <>      

           {getCookie('user') && (getCookie('user').role == 'PATIENT' || getCookie('user').role == 'DOCTOR') ?<div className="home-container">
                <div className="details-row">
                    <div>
                        <label >CNP PATIENT: </label>
                        <input type="text" value={cnpPatient} readOnly/>
                    </div>
                    <div>
                        <label >ID DOCTOR: </label>
                        <input type="text" value={idDoctor} readOnly/>
                    </div>
                    <div>
                        <label >DATE: </label>
                        <input type="text" value={date} readOnly/>
                    </div>
                </div>
                {getCookie('user').role == 'DOCTOR' ? (
                <form onSubmit={saveDiagnostic}>
                    <label >DIAGNOSTIC: </label>

                    <select id="dropdown" value={diagnostic} onChange={handleSelectDiagnostic}>
                        <option value="SANATOS">SANATOS</option>
                        <option value="BOLNAV">BOLNAV</option>
                    </select>
                    <button type="submit">Set</button>
                </form>) :
                (<div>
                    <label >DIAGNOSTIC: </label>
                    <input type="text" value={diagnostic} onChange={(e) => setDiagnostic(e.target.value)} readOnly/>
                </div>
                )}

                {isAdding && (
                                <table>
                                    <tbody>
                                        <tr key="addInvestigatie">
                                            {(getCookie('user').role === 'DOCTOR') && <td></td>}
                                            <td>
                                                Denumire
                                                <input
                                                    type="text"
                                                    name="denumire"
                                                    value={denumire}
                                                    onChange={handleInputDenumireChange}
                                                />
                                            </td>
                                            <td>
                                                Durata
                                                <input
                                                    type="number"
                                                    name="durata"
                                                    value={durata}
                                                    onChange={handleInputDurataChange}
                                                />
                                            </td>
                                            <td>
                                                Rezultat
                                                <input
                                                    type="text"
                                                    name="rezultat"
                                                    value={rezultat}
                                                    onChange={handleInputRezultatChange}
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
                {<div>
                    <table style={{ margin: 'auto' }}>
                        <thead  style={{backgroundColor: '#000000', color: '#ffffff'}}>
                            <tr>
                                <th>ID</th>
                                <th>Denumire</th>
                                <th>Durata</th>
                                <th>Rezultat</th>
                                {(getCookie('user').role === 'DOCTOR')&&<th><button onClick={() => handleAdd()}>Add</button></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {investigatii.map((row, index) => (
                                <tr key={row.id} style={{ backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}>
                                <td id="id" value={row.id} style={{display: 'none'}}></td>
                                <td>{index}</td>
                                {/* <td>{row.denumire}</td>
                                <td>{row.durata}H</td>
                                <td>{row.rezultat}</td> */}

                                {(getCookie('user').role == 'DOCTOR') ? (<td>
                                    {editableRowIndex === row.id ? (
                                        <input
                                        type="text"
                                        value={row.denumire}
                                        onChange={(e) => handleInputChange(row.id, 'denumire', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.denumire
                                    )}
                                </td>) :(<td>{row.denumire}</td>)}
                                {(getCookie('user').role == 'DOCTOR') ? (<td>
                                    {editableRowIndex === row.id ? (
                                        <input
                                        type="number"
                                        value={row.durata}
                                        onChange={(e) => handleInputChange(row.id, 'durata', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.durata+"H"
                                    )}
                                </td>) : (<td>{row.durata}H</td>)}
                                {(getCookie('user').role == 'DOCTOR') ? (<td>
                                    {editableRowIndex === row.id ? (
                                        <input
                                        type="text"
                                        value={row.rezultat}
                                        onChange={(e) => handleInputChange(row.id, 'rezultat', e.target.value)}
                                        style={{ width: '80%', margin: 'auto', backgroundColor: index % 2 === 0 ? '#45a049' : 'white' }}
                                        />
                                    ) : (
                                        row.rezultat
                                    )}
                                </td>) : (<td>{row.rezultat}</td>)}
                                {(getCookie('user').role == 'DOCTOR') && <td style={{backgroundColor: 'wheat'}} >
                                        {editableRowIndex === row.id ? (
                                        <div>
                                            <button onClick={() => handleSave(row)}>Save</button>
                                            <button onClick={() => handleCancel()}>Cancel</button>
                                        </div>
                                        ) : (
                                        <button onClick={() => handleEdit(row.id)}>Edit</button>
                                        )}
                                    </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div> : (<p>Not authorized!!!</p>)}
        </>

  );
};

export default Examinations;

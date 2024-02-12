import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import React, { useState } from 'react';
import Auth from './pages/Auth'
import Home from './pages/Home'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Examinations from './pages/Examinations'
import Navbar from "./components/Navbar";
import { UserProvider } from './context/UserContext';
import { getCookie } from './utils/cookieUtils';
import './App.css'

function App() {
  return (
    <div className="app-container">
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="" element={<Navigate to="/home"/>}/>
            <Route path="Auth" element={<Auth/>}/>
            <Route path="Home" element={<Home/>}/>
            <Route path="Appointments" element={<Appointments/>}/>
            <Route path="Patients" element={<Patients/>}/>
            <Route path="Doctors" element={<Doctors/>}/>
            <Route path="Register" element={<Register/>}/>
            <Route path="Admin" element={<Admin/>}/>
            <Route path="Examinations" element={<Examinations/>}/>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;

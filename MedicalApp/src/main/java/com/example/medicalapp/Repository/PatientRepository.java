package com.example.medicalapp.Repository;

import com.example.medicalapp.DTO.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
//import org.springframework.data.repository.Repository;

@Repository
public interface  PatientRepository extends JpaRepository<Patient, Integer> {

    @Query("SELECT p FROM Patient p")
    List<Patient> getAllPatients();
    @Query("SELECT p FROM Patient p WHERE p.is_active = ?1")
    List<Patient> getActivePatients(Boolean is_active);
    @Query("SELECT p FROM Patient p WHERE p.cnp = ?1")
    Patient findPatientByCnp(String cnp);
    @Query("SELECT p FROM Patient p WHERE p.id_user = ?1")
    Patient findPatientByUserId(int user_id);
    @Query("SELECT p FROM Patient p WHERE p.cnp=?1 or p.id_user=?2 or p.email=?3 or p.phone=?4")
    Patient exists(String cnp, int user_id, String email, String phone);



}

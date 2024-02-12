package com.example.medicalapp.Repository;

import com.example.medicalapp.DTO.Patient;
import com.example.medicalapp.Enums.Specialization;
import com.example.medicalapp.DTO.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    @Query("SELECT d FROM Doctor d")
    List<Doctor> getAllDoctors();

    @Query("SELECT d FROM Doctor d WHERE d.id = ?1")
    Doctor findDoctorById(int id);

    @Query("SELECT d FROM Doctor d WHERE d.specialization = ?1")
    List<Doctor> findDoctorsBySpecialization(Specialization specialization);

    @Query("SELECT d FROM Doctor d WHERE d.firstname = ?1 or d.lastname = ?1")
    List<Doctor> findDoctorsByName(String name);

    @Query("SELECT d FROM Doctor d WHERE d.id_user = ?1")
    Doctor findDoctorByUserId(int user_id);
    @Query("SELECT d FROM Doctor d WHERE d.id_user=?1 or d.email=?2 or d.phone=?3")
    Doctor exists(int user_id, String email, String phone);

}

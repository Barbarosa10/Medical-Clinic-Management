package com.example.medicalapp.Repository;

import com.example.medicalapp.DTO.Appointment;
import com.example.medicalapp.DTO.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;

@Repository
public interface AppointmentRepository  extends JpaRepository<Appointment, Integer> {
    @Query("SELECT a FROM Appointment a")
    List<Appointment> getAllAppointments();
    @Query("SELECT a FROM Appointment a WHERE a.cnp_patient = ?1 and a.id_doctor= ?2 and a.date = ?3")
    Appointment findAppointment(String cnp_patient, Integer id_doctor, Date date);
    @Query("SELECT a FROM Appointment a WHERE a.cnp_patient = ?1")
    List<Appointment> findAppointmentByCnp(String cnp_patient);
    @Query("SELECT a FROM Appointment a WHERE a.id_doctor = ?1")
    List<Appointment> findAppointmentById(int id_doctor);
    @Query("SELECT a FROM Appointment a WHERE a.cnp_patient = ?1 and a.date = ?2")
    Appointment findAppointmentByDate(String cnp, Date date);
    @Query("SELECT a FROM Appointment a WHERE a.cnp_patient = ?1 and MONTH(a.date) = ?2")
    Appointment findAppointmentByMonth(String cnp, int date);
    @Query("SELECT a FROM Appointment a WHERE a.cnp_patient = ?1 and MONTH(a.date) = MONTH(CURDATE()) and DAY(a.date) = ?2")
    Appointment findAppointmentByDayInCurrentMonth(String cnp, int date);
    @Query("SELECT a FROM Appointment a WHERE a.id_doctor=?1 and a.cnp_patient=?2 and a.date=?3")
    Appointment exists(int id, String cnp, Date date);
}

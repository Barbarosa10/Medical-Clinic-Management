package com.example.medicalapp.Controller;

import com.example.medicalapp.DTO.Appointment;
import com.example.medicalapp.DTO.Doctor;
import com.example.medicalapp.DTO.Patient;
import com.example.medicalapp.Repository.AppointmentRepository;
import com.example.medicalapp.Repository.PatientRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.sql.Date;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/medical_office/patients")
public class PatientController {
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("")
    public ResponseEntity<?> getAllPatients(@RequestParam Optional<Boolean> is_active){
        List<Patient> patientList;
        if(is_active.isPresent()){
            patientList = patientRepository.getActivePatients(is_active.get());
        }
        else{
            patientList = patientRepository.getAllPatients();
        }
        if(patientList.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        for(final Patient patient : patientList){
            patient.add(linkTo(methodOn(PatientController.class).getPatientByCnp(patient.getCnp())).withSelfRel());
        }
        return new ResponseEntity<>(patientList, HttpStatus.OK);
    }

    @GetMapping(value ="", params = {"user_id"})
    public ResponseEntity<?> getPatientByUserId(@RequestParam  Integer user_id){
        Patient patient = patientRepository.findPatientByUserId(user_id);
        if(patient == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        patient.add(linkTo(methodOn(PatientController.class).getPatientByUserId(user_id)).withSelfRel());

        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @GetMapping("/{cnp}")
    public ResponseEntity<?> getPatientByCnp(@PathVariable String cnp){
        Patient patient = patientRepository.findPatientByCnp(cnp);
        if(patient == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        patient.add(linkTo(methodOn(PatientController.class).getPatientByCnp(cnp)).withSelfRel());
        patient.add(linkTo(methodOn(PatientController.class).getAppointments(cnp)).withRel("patientAppointments"));

        return new ResponseEntity<>(patient, HttpStatus.OK);
    }
    @GetMapping(value="/{cnp}/physicians")
    public ResponseEntity<List<Appointment>> getAppointments(@PathVariable String cnp)
    {
        Patient patient = patientRepository.findPatientByCnp(cnp);
        if(patient == null)
        {
            return new ResponseEntity<>(new ArrayList<Appointment>(), HttpStatus.NOT_FOUND);
        }
        List<Appointment> appointmentList = appointmentRepository.findAppointmentByCnp(cnp);
        if(appointmentList.isEmpty()){
            return new ResponseEntity<>(new ArrayList<Appointment>(), HttpStatus.OK);
        }
        for (final Appointment appointment : appointmentList)
        {
            appointment.add(linkTo(methodOn(PatientController.class).getAppointment(appointment.getId_doctor(),cnp, appointment.getDate())).withSelfRel());
        }
        return new ResponseEntity<>(appointmentList, HttpStatus.OK);
    }
    @GetMapping("/{cnp}/physicians/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable int id, @PathVariable String cnp, @RequestParam Date date)
    {
        Appointment appointment = appointmentRepository.findAppointment(cnp, id, date);
        if(appointment == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        else{
            return new ResponseEntity<>(appointment, HttpStatus.OK);
        }
    }

    @GetMapping(value ="/{cnp}/physicians", params = {"date", "type"})
    public ResponseEntity<?> filterAppointmentsByDateAndType(@PathVariable String cnp, @RequestParam Integer date, @RequestParam String type){
        if(Objects.equals(type, "month")){
            Appointment appointment = appointmentRepository.findAppointmentByMonth(cnp, date);
            if(appointment == null)
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            else{

                return new ResponseEntity<>(appointment, HttpStatus.OK);
            }

        }else if(Objects.equals(type, "day")){
            Appointment appointment = appointmentRepository.findAppointmentByDayInCurrentMonth(cnp, date);
            if(appointment == null)
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            else{
                Link selfLink = linkTo(methodOn(AppointmentController.class)
                        .getAppointmentsByCnp(cnp)).withSelfRel();
                EntityModel<Appointment> appointmentModel = EntityModel.of(appointment, selfLink);
                return new ResponseEntity<>(appointmentModel, HttpStatus.OK);
            }
        }else{
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping(value ="/{cnp}/physicians", params = "date")
    public ResponseEntity<?> filterAppointmentsByDate(@PathVariable String cnp, @RequestParam Date date){
        Appointment appointment = appointmentRepository.findAppointmentByDate(cnp, date);
        if(appointment == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(appointment, HttpStatus.OK);
    }

    @PostMapping("")
    public ResponseEntity<?> save(@RequestBody Patient patient) {
        if(patientRepository.exists(patient.getCnp(), patient.getId_user(), patient.getEmail(), patient.getPhone()) == null){
            Patient savedPatient =  patientRepository.save(patient);
            return new ResponseEntity<>(savedPatient, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.CONFLICT);

    }

    @PutMapping("/{cnp}/physicians/{id}")
    public ResponseEntity<?> update(@PathVariable String cnp, @PathVariable int id, @RequestParam  Date date, @RequestBody Appointment updatedAppointment){
        try{
            System.out.println("" + cnp + " " + id + " " + date);
            Appointment existingAppointment = appointmentRepository.findAppointment(cnp, id, date);

            existingAppointment.setStatus(updatedAppointment.getStatus());

            Appointment savedAppointment = appointmentRepository.save(existingAppointment);
            return new ResponseEntity<>(savedAppointment, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            Appointment savedAppointment = appointmentRepository.save(updatedAppointment);
            return new ResponseEntity<>(savedAppointment, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @DeleteMapping("/{cnp}/physicians/{id}")
    public ResponseEntity<?> delete(@PathVariable String cnp, @PathVariable int id, @RequestParam  Date date){
        try{
            System.out.println("" + cnp + " " + id + " " + date);
            Appointment existingAppointment = appointmentRepository.findAppointment(cnp, id, date);
            if(existingAppointment == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            appointmentRepository.delete(existingAppointment);

            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{cnp}")
    public ResponseEntity<?> save(@PathVariable String cnp, @RequestBody Patient updatedPatient){

        try{
            Patient existingPatient = patientRepository.findPatientByCnp(cnp);

            existingPatient.setId_user(updatedPatient.getId_user());
            existingPatient.setLastname(updatedPatient.getLastname());
            existingPatient.setPhone(updatedPatient.getPhone());
            existingPatient.setFirstname(updatedPatient.getFirstname());
            existingPatient.setEmail(updatedPatient.getEmail());
            existingPatient.setBirth_date(updatedPatient.getBirth_date());
            existingPatient.setIs_active(updatedPatient.getIs_active());


            Patient savedPatient = patientRepository.save(existingPatient);
            return new ResponseEntity<>(savedPatient, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            Patient savedPatient = patientRepository.save(updatedPatient);
            return new ResponseEntity<>(savedPatient, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @DeleteMapping("/{cnp}")
    public ResponseEntity<?> delete(@PathVariable String cnp){
        try{
            Patient existingPatient = patientRepository.findPatientByCnp(cnp);
            if(existingPatient == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            patientRepository.delete(existingPatient);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}

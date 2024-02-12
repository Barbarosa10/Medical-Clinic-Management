package com.example.medicalapp.Controller;

import com.example.medicalapp.DTO.Patient;
import com.example.medicalapp.Enums.Specialization;
import com.example.medicalapp.DTO.Appointment;
import com.example.medicalapp.DTO.Doctor;
import com.example.medicalapp.Repository.AppointmentRepository;
import com.example.medicalapp.Repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/medical_office/physicians")
public class DoctorController {
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable int id){
        Doctor doctor = doctorRepository.findDoctorById(id);
        if(doctor != null){
            doctor.add(linkTo(methodOn(DoctorController.class).getDoctorById(doctor.getId())).withSelfRel());
            doctor.add(linkTo(methodOn(DoctorController.class).getAllDoctors(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty())).withRel("parent"));
            doctor.add(linkTo(methodOn(DoctorController.class).getPatientsForDoctor(doctor.getId())).withRel("patientsForDoctor"));
            return new ResponseEntity<>(doctor, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @GetMapping(value ="", params = {"user_id"})
    public ResponseEntity<?> getDoctorByUserId(@RequestParam  Integer user_id){
        Doctor doctor = doctorRepository.findDoctorByUserId(user_id);
        if(doctor == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        doctor.add(linkTo(methodOn(DoctorController.class).getDoctorByUserId(user_id)).withSelfRel());

        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    @GetMapping("")
    public ResponseEntity<?> getAllDoctors(@RequestParam Optional<Specialization> specialization, @RequestParam Optional<String> name, @RequestParam Optional<Integer> page, @RequestParam Optional<Integer> items_per_page){

        List<Doctor> doctorList;
        if(specialization.isPresent()){
            doctorList = doctorRepository.findDoctorsBySpecialization(specialization.get());
            if(doctorList.isEmpty())
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            else{
                for(final Doctor doctor : doctorList){
                    doctor.add(linkTo(methodOn(DoctorController.class).getDoctorById(doctor.getId())).withSelfRel());
                }
                return new ResponseEntity<>(doctorList, HttpStatus.OK);
            }




        }else if(name.isPresent()){
            doctorList = doctorRepository.findDoctorsByName(name.get());
            if(!doctorList.isEmpty()){
                for(final Doctor doctor : doctorList){
                    doctor.add(linkTo(methodOn(DoctorController.class).getDoctorById(doctor.getId())).withSelfRel());
                }
                return new ResponseEntity<>(doctorList, HttpStatus.OK);
            }
            else{
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }
        else if(page.isPresent()){
            int pageSize = 10;
            if(items_per_page.isPresent()){
                pageSize = items_per_page.get();
            }

            doctorList = doctorRepository.findAll(PageRequest.of(page.get(), pageSize)).getContent();


            if(doctorList.isEmpty())
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            else{
                for(final Doctor doctor : doctorList){
                    doctor.add(linkTo(methodOn(DoctorController.class).getDoctorById(doctor.getId())).withSelfRel());
                }
                return new ResponseEntity<>(doctorList, HttpStatus.OK);
            }

        }
        else{
            doctorList = doctorRepository.getAllDoctors();

            if(doctorList.isEmpty())
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            else{
                for(final Doctor doctor : doctorList){
                    doctor.add(linkTo(methodOn(DoctorController.class).getDoctorById(doctor.getId())).withSelfRel());
                }
                return new ResponseEntity<>(doctorList, HttpStatus.OK);
            }
        }

    }
    @GetMapping(value="/{id}/patients/{cnp}", params = "date")
    public ResponseEntity<Appointment> getAppointment(@PathVariable int id, @PathVariable String cnp, @RequestParam Date date)
    {
        Appointment appointment = appointmentRepository.findAppointment(cnp, id, date);
        if(appointment == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        else{
            appointment.add(linkTo(methodOn(DoctorController.class).getAppointment(id, cnp, date)).withSelfRel());
            appointment.add(linkTo(methodOn(DoctorController.class).getPatientsForDoctor(id)).withRel("parent"));
            return new ResponseEntity<>(appointment, HttpStatus.OK);
        }
    }
    @GetMapping("/{id}/patients")
    public ResponseEntity<List<Appointment>> getPatientsForDoctor(@PathVariable int id)
    {
        Doctor doctor = doctorRepository.findDoctorById(id);
        if (doctor == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        else{
            List<Appointment> appointmentList = appointmentRepository.findAppointmentById(id);
            for (final Appointment appointment : appointmentList)
            {
                appointment.add(linkTo(methodOn(DoctorController.class).getAppointment(id,appointment.getCnp_patient(), appointment.getDate())).withSelfRel());
                appointment.add(linkTo(methodOn(DoctorController.class).getDoctorById(id)).withRel("parent"));
            }
            return new ResponseEntity<>(appointmentList, HttpStatus.OK);
        }
    }

    @PutMapping(value="/{id}/patients/{cnp}", params = "date")
    public ResponseEntity<?> update(@PathVariable String cnp, @PathVariable int id, @RequestParam Date date, @RequestBody Appointment updatedAppointment){
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

    @DeleteMapping("/{id}/patients/{cnp}")
    public ResponseEntity<?> deleteAppoinment(@PathVariable String cnp, @PathVariable int id, @RequestParam  Date date){
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

    @PostMapping("")
    public ResponseEntity<?> save(@RequestBody Doctor doctor) {
        if(doctorRepository.exists(doctor.getId_user(), doctor.getEmail(), doctor.getPhone()) == null){
            Doctor savedDoctor =  doctorRepository.save(doctor);

            return new ResponseEntity<>(savedDoctor, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.CONFLICT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Doctor updatedDoctor){
        try{
            Doctor existingDoctor = doctorRepository.findDoctorById(id);

            existingDoctor.setId_user(updatedDoctor.getId_user());
            existingDoctor.setLastname(updatedDoctor.getLastname());
            existingDoctor.setPhone(updatedDoctor.getPhone());
            existingDoctor.setFirstname(updatedDoctor.getFirstname());
            existingDoctor.setSpecialization(updatedDoctor.getSpecialization());
            existingDoctor.setEmail(updatedDoctor.getEmail());

            Doctor savedDoctor = doctorRepository.save(existingDoctor);
            return new ResponseEntity<>(savedDoctor, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            Doctor savedDoctor = doctorRepository.save(updatedDoctor);
            return new ResponseEntity<>(savedDoctor, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable int id){
        try{
            Doctor existingDoctor = doctorRepository.findDoctorById(id);
            if(existingDoctor == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            doctorRepository.delete(existingDoctor);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

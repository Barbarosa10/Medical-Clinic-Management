package com.example.medicalapp.Controller;

import com.example.medicalapp.DTO.Appointment;
import com.example.medicalapp.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/medical_office/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentRepository appointmentRepository;

    @PutMapping("")
    public ResponseEntity<?> save(@RequestBody Appointment appointment) {
        System.out.println(appointment.getStatus());
        if(appointmentRepository.exists(appointment.getId_doctor(), appointment.getCnp_patient(), appointment.getDate()) == null){
            Appointment savedAppointment =  appointmentRepository.save(appointment);
            return new ResponseEntity<>(savedAppointment, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.CONFLICT);
    }



    @GetMapping(value = "")
    public ResponseEntity<?> getAppointments(@RequestParam Optional<String> cnp, @RequestParam Optional<Integer> id){
        List<Appointment> appointmentList;
        if(cnp.isPresent()){
            appointmentList = appointmentRepository.findAppointmentByCnp(cnp.get());
            for(final Appointment appointment : appointmentList){
                appointment.add(linkTo(methodOn(AppointmentController.class).getAppointmentsByCnp(cnp.get())).withSelfRel());
            }
        }
        else if(id.isPresent()){
            appointmentList = appointmentRepository.findAppointmentById(id.get());
            for(final Appointment appointment : appointmentList){
                appointment.add(linkTo(methodOn(AppointmentController.class).getAppointmentsById(id.get())).withSelfRel());
            }
        }
        else{
            appointmentList = appointmentRepository.getAllAppointments();
            for(final Appointment appointment : appointmentList){
                appointment.add(linkTo(methodOn(AppointmentController.class).getAppointments(null, null)).withSelfRel());
            }
        }

        return new ResponseEntity<>(appointmentList, HttpStatus.OK);

    }

    public ResponseEntity<?> getAppointmentsByCnp(@PathVariable String cnp){
        List<Appointment> appointmentList = appointmentRepository.findAppointmentByCnp(cnp);

        if(appointmentList.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        for(final Appointment appointment : appointmentList){
            appointment.add(linkTo(methodOn(AppointmentController.class).getAppointmentsByCnp(appointment.getCnp_patient())).withSelfRel());
        }

        return new ResponseEntity<>(appointmentList, HttpStatus.OK);

    }

    public ResponseEntity<?> getAppointmentsById(@PathVariable int id){
        List<Appointment> appointmentList = appointmentRepository.findAppointmentById(id);

        if(appointmentList.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        for(final Appointment appointment : appointmentList){
            appointment.add(linkTo(methodOn(AppointmentController.class).getAppointmentsById(appointment.getId_doctor())).withSelfRel());
        }

        return new ResponseEntity<>(appointmentList, HttpStatus.OK);

    }


}

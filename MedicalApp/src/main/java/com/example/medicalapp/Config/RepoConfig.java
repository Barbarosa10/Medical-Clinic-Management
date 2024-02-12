package com.example.medicalapp.Config;

import com.example.medicalapp.DTO.Appointment;
import com.example.medicalapp.DTO.Doctor;
import com.example.medicalapp.DTO.Patient;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class RepoConfig implements RepositoryRestConfigurer {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        config.exposeIdsFor(Doctor.class, Patient.class, Appointment.class);
    }
}
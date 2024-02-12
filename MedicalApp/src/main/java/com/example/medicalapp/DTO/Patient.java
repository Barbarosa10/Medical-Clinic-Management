package com.example.medicalapp.DTO;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.sql.Date;

@Entity
@Table(name="patients")
@Getter
@Setter
public class Patient extends RepresentationModel<Patient> {

    @Id
    @Column(name = "cnp")
    private String cnp;

    @Basic
    @Column(name = "id_user")
    private int id_user;

    @Basic
    @Column(name = "firstname")
    private String firstname;

    @Basic
    @Column(name = "lastname")
    private String lastname;

    @Basic
    @Column(name = "email")
    private String email;

    @Basic
    @Column(name = "phone")
    private String phone;

    @Basic
    @Column(name = "birth_date")
    private Date birth_date;

    @Basic
    @Column(name = "is_active")
    private Boolean is_active;


}

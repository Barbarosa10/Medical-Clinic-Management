package com.example.medicalapp.DTO;

import org.springframework.hateoas.RepresentationModel;
import com.example.medicalapp.Enums.Specialization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="doctors")
@Getter
@Setter
public class Doctor extends RepresentationModel<Doctor>{
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "id")
    private int id;

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
    @Enumerated(EnumType.STRING)
    @Column(name = "specialization")
    private Specialization specialization;
}

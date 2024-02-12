package com.example.medicalapp.DTO;

import com.example.medicalapp.Enums.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.io.Serializable;
import java.sql.Date;
import java.util.Objects;

class CompositeKey implements Serializable {
    private String cnp_patient;
    private int id_doctor;
    private Date date;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CompositeKey that = (CompositeKey) o;
        return id_doctor == that.id_doctor &&
                Objects.equals(cnp_patient, that.cnp_patient) &&
                Objects.equals(date, that.date);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cnp_patient, id_doctor, date);
    }
}

@Entity
@Table(name = "appointments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_doctor", "cnp_patient", "date"})
})
@Getter
@Setter
@IdClass(CompositeKey.class)
public class Appointment extends RepresentationModel<Appointment> {
    @Id
    @Column(name = "id_doctor")
    private int id_doctor;

    @Id
    @Column(name = "cnp_patient")
    private String cnp_patient;

    @Id
    @Column(name = "date")
    private Date date;

    @Basic
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;


}

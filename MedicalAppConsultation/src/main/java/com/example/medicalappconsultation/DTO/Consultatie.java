package com.example.medicalappconsultation.DTO;

import com.example.medicalappconsultation.Enums.Diagnostics;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

@Document("consultatii")
@CompoundIndex(def = "{'id_doctor' : 1, 'cnp_patient' : 1, 'date' : 1}", unique = true)
public class Consultatie {
    @Id
    private String _id;
    private String cnp_patient;
    private int id_doctor;

    private Date date;
    private Diagnostics diagnostic;
    private List<Investigatie> investigatii;

    public Consultatie(String cnp_patient, int id_doctor, Date date, Diagnostics diagnostic, List<Investigatie> investigatii) {
        this.cnp_patient = cnp_patient;
        this.id_doctor = id_doctor;
        this.date = date;
        this.diagnostic = diagnostic;
        this.investigatii = investigatii;
    }

    public String get_id() {
        return _id;
    }

    public String getCnp_patient() {
        return cnp_patient;
    }
    public void setCnp_patient(String cnp_patient) {
        this.cnp_patient = cnp_patient;
    }
    public int getId_doctor() {
        return id_doctor;
    }
    public void setId_doctor(int id_doctor) {
        this.id_doctor = id_doctor;
    }
    public Date getDate() {
        return date;
    }
    public void setDate(Date date) {
        this.date = date;
    }
    public Diagnostics getDiagnostic() {
        return diagnostic;
    }
    public void setDiagnostic(Diagnostics diagnostic) {
        this.diagnostic = diagnostic;
    }
    public List<Investigatie> getInvestigatii() {
        return investigatii;
    }
    public void setInvestigatii(List<Investigatie> investigatii) {
        this.investigatii = investigatii;
    }
}

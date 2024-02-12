package com.example.medicalappconsultation.DTO;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

public class Investigatie {
    @Indexed
    private String id;
    private String denumire;
    private int durata;
    private String rezultat;

    public Investigatie(String denumire, int durata, String rezultat) {
        this.id = new ObjectId().toString();
        this.denumire = denumire;
        this.durata = durata;
        this.rezultat = rezultat;
    }

    public String getId() {
        return id;
    }

    public String getDenumire() {
        return denumire;
    }

    public void setDenumire(String denumire) {
        this.denumire = denumire;
    }

    public int getDurata() {
        return durata;
    }

    public void setDurata(int durata) {
        this.durata = durata;
    }

    public String getRezultat() {
        return rezultat;
    }

    public void setRezultat(String rezultat) {
        this.rezultat = rezultat;
    }
}

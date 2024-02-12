package com.example.medicalappconsultation.Repository;

import com.example.medicalappconsultation.DTO.Consultatie;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Date;
import java.util.List;

public interface ConsultatieRepository extends MongoRepository<Consultatie, String> {
    @Query("{id_doctor: ?0, cnp_patient: ?1, date: { $eq: ?2 }}")
        //@Query("{$and :[{author: ?0},{cost: ?1}] }")
    Consultatie getConsultatieByIdAndCnpAndDate(int id_doctor, String cnp_patient, Date date);
}

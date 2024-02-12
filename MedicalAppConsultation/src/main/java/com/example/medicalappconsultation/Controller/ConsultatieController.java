package com.example.medicalappconsultation.Controller;

import com.example.medicalappconsultation.DTO.Consultatie;
import com.example.medicalappconsultation.DTO.Investigatie;
import com.example.medicalappconsultation.Repository.ConsultatieRepository;
import com.mongodb.DuplicateKeyException;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical_office/consultatii")
public class ConsultatieController {
    @Autowired
    private ConsultatieRepository consultatieRepository;

    @GetMapping("")
    List<Consultatie> getAllConsultatii()
    {
        return consultatieRepository.findAll();
    }

    @PostMapping("")
    ResponseEntity<?>  addConsultatie(@RequestBody Consultatie consultatie)
    {
        Consultatie consultatie1;
        try {

            consultatie1 = consultatieRepository.insert(consultatie);
        }
        catch(Exception e){
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        return  new ResponseEntity<>(consultatie1, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    ResponseEntity<Consultatie> findConsultatieById(@PathVariable String id)
    {
        return consultatieRepository.findById(id).map(
                consultatie -> new ResponseEntity<>(consultatie, HttpStatus.OK)).orElseGet(
                () -> new ResponseEntity<>(null, HttpStatus.NOT_FOUND));
    }

    @GetMapping(value ="", params = {"id_doctor", "cnp_patient", "date"})
    ResponseEntity<Consultatie> findConsultatieByCnpAndIdAndDate(@RequestParam int id_doctor, @RequestParam String cnp_patient, @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @RequestParam Date date) throws ParseException {
        System.out.println(cnp_patient +" " + id_doctor + " " + date);
//        String isoDateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//        Date endDate = sdf.parse(String.valueOf(isoDateString));
//        System.out.println(endDate);
        Consultatie consultatie = consultatieRepository.getConsultatieByIdAndCnpAndDate(id_doctor, cnp_patient, date);
        System.out.println(consultatie);
        if(consultatie != null){
            return new ResponseEntity<>(consultatie, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}")
    ResponseEntity<Consultatie> updateOrAddConsultatie(@PathVariable String id, @RequestBody Consultatie consultatie)
    {
        return consultatieRepository.findById(id).map(
                _consultatie -> {
                    _consultatie.setDiagnostic(consultatie.getDiagnostic());
                    if(!consultatie.getInvestigatii().isEmpty())
                        _consultatie.setInvestigatii(consultatie.getInvestigatii());
                    consultatieRepository.save(_consultatie);
                    return new ResponseEntity<>(_consultatie, HttpStatus.OK);
                }).orElseGet(
                () -> {
                    consultatieRepository.insert(consultatie);
                    return new ResponseEntity<>(consultatie, HttpStatus.CREATED);
                });
    }

    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteConsultatie(@PathVariable String id)
    {
        Optional<Consultatie> consultatie = consultatieRepository.findById(id);
        if(consultatie.isPresent()){
            consultatieRepository.delete(consultatie.get());
            return  new ResponseEntity<>(consultatie.get(), HttpStatus.OK);
        }
        else{
            return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    @DeleteMapping("/{id}/investigatii/{investigatie_id}")
    ResponseEntity<?> deleteInvestigatie(@PathVariable String id, @PathVariable String investigatie_id)
    {
        return consultatieRepository.findById(id).map(
                consultatie -> {
                    List<Investigatie> investigatieList = consultatie.getInvestigatii();
                    for(Investigatie investigatie : investigatieList){
                        if(investigatie.getId().equals(investigatie_id)){
                            investigatieList.remove(investigatie);
                            break;
                        }
                    }
                    consultatie.setInvestigatii(investigatieList);
                    consultatieRepository.save(consultatie);
                    return  new ResponseEntity<>(consultatie, HttpStatus.OK);
                }).orElseGet(
                () -> new ResponseEntity<>(HttpStatus.NOT_FOUND));

    }


    @PutMapping("/{id}/investigatii")
    ResponseEntity<Consultatie> updateOrAddInvestigatie(@PathVariable String id, @RequestParam Optional<String> investigatie_id, @RequestBody Investigatie investigatie)
    {
        Optional<Consultatie> consultatie = consultatieRepository.findById(id);
        if(consultatie.isPresent()){
            boolean investigatie_found = false;
            List<Investigatie> investigatieList = consultatie.get().getInvestigatii();

            if(investigatie_id.isPresent()){
                for(Investigatie _investigatie : investigatieList){
                    if(_investigatie.getId().equals(investigatie_id.get())){
                        _investigatie.setDenumire(investigatie.getDenumire());
                        _investigatie.setDurata(investigatie.getDurata());
                        _investigatie.setRezultat(investigatie.getRezultat());
                        investigatie_found = true;
                    }
                }
            }

            if(investigatie_found){
                System.out.println("AAA");
                consultatie.get().setInvestigatii(investigatieList);
                consultatieRepository.save(consultatie.get());
                return  new ResponseEntity<>(consultatie.get(), HttpStatus.OK);
            }
            else{
                investigatieList.add(investigatie);
                consultatie.get().setInvestigatii((investigatieList));
                consultatieRepository.save(consultatie.get());
                return  new ResponseEntity<>(consultatie.get(), HttpStatus.CREATED);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

}

package com.delrey.hodometro;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeituraKmRepository extends JpaRepository<LeituraKm, Long> {
    List<LeituraKm> findByCarroIdOrderByDataDesc(Long carroId);
    List<LeituraKm> findByCarroIdAndDataBetweenOrderByDataAsc(Long carroId, LocalDate inicio, LocalDate fim);
}

package com.delrey.combustivel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AbastecimentoRepository extends JpaRepository<Abastecimento, Long> {
    List<Abastecimento> findAllByOrderByDataDesc();
    List<Abastecimento> findAllByOrderByDataAsc();
    List<Abastecimento> findByDataBetweenOrderByDataAsc(LocalDate inicio, LocalDate fim);
}

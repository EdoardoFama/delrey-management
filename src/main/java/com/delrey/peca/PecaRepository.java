package com.delrey.peca;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PecaRepository extends JpaRepository<Peca, Long> {
    List<Peca> findByNomeContainingIgnoreCaseOrderByNome(String termo);
    List<Peca> findAllByOrderByNome();

    @Query("SELECT p FROM Peca p WHERE (p.tipoVeiculo IN :tipos OR p.tipoVeiculo IS NULL) ORDER BY p.nome")
    List<Peca> findAllByTiposVeiculoOrderByNome(@Param("tipos") List<String> tipos);

    @Query("SELECT p FROM Peca p WHERE (p.tipoVeiculo IN :tipos OR p.tipoVeiculo IS NULL) AND LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) ORDER BY p.nome")
    List<Peca> findByTiposVeiculoAndNome(@Param("tipos") List<String> tipos, @Param("termo") String termo);
}

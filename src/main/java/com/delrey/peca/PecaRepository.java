package com.delrey.peca;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PecaRepository extends JpaRepository<Peca, Long> {
    List<Peca> findByNomeContainingIgnoreCaseOrderByNome(String termo);
    List<Peca> findAllByOrderByNome();
}

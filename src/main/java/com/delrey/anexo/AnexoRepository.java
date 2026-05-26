package com.delrey.anexo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnexoRepository extends JpaRepository<Anexo, Long> {
    List<Anexo> findByTrocaIdOrderByCriadoEmDesc(Long trocaId);
}

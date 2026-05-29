package com.delrey.problema;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemaRepository extends JpaRepository<Problema, Long> {
    List<Problema> findAllByOrderByDataInicioDesc();
}

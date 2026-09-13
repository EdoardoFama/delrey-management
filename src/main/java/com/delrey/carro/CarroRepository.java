package com.delrey.carro;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CarroRepository extends JpaRepository<Carro, Long> {
    Optional<Carro> findByUsuario(String usuario);
}

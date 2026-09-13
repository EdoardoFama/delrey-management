package com.delrey.carro;

import java.util.Optional;

public interface CarroRepository extends JpaRepository<Carro, Long> {
    Optional<Carro> findByUsuario(String usuario);
}

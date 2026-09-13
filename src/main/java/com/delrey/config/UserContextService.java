package com.delrey.config;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserContextService {

    private final CarroRepository carroRepository;

    public UserContextService(CarroRepository carroRepository) {
        this.carroRepository = carroRepository;
    }

    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "delrey";
    }

    public Carro getCarroDoUsuarioAtual() {
        String username = getCurrentUsername();
        return carroRepository.findByUsuario(username)
                .orElseGet(() -> {
                    Carro c = new Carro();
                    c.setUsuario(username);
                    c.setModelo(username.equalsIgnoreCase("tigo5x") ? "Tigo 5X" : "Meu Carro");
                    c.setAno(2026);
                    c.setKmAtual(0);
                    return carroRepository.save(c);
                });
    }
}

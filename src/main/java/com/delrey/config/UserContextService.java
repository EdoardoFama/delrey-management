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

        try {
            org.springframework.web.context.request.ServletRequestAttributes attrs = 
                (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                jakarta.servlet.http.HttpServletRequest request = attrs.getRequest();
                String vehicleIdStr = request.getHeader("X-Vehicle-Id");
                if (vehicleIdStr != null && !vehicleIdStr.isBlank()) {
                    Long vehicleId = Long.parseLong(vehicleIdStr);
                    return carroRepository.findById(vehicleId)
                        .filter(c -> c.getUsuario() != null && c.getUsuario().equals(username))
                        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Veículo não pertence ao usuário ou não encontrado"));
                }
            }
        } catch (NumberFormatException ignored) {}

        return carroRepository.findFirstByUsuarioOrderByIdAsc(username)
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

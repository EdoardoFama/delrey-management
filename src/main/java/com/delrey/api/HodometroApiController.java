package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.config.UserContextService;
import com.delrey.hodometro.LeituraKm;
import com.delrey.hodometro.LeituraKmRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/hodometro")
public class HodometroApiController {

    private final LeituraKmRepository repo;
    private final CarroRepository carroRepository;
    private final UserContextService userContextService;

    public HodometroApiController(LeituraKmRepository repo, CarroRepository carroRepository, UserContextService userContextService) {
        this.repo = repo;
        this.carroRepository = carroRepository;
        this.userContextService = userContextService;
    }

    public record LeituraDto(Long id, LocalDate data, Integer km, String observacoes) {}
    public record LeituraRequest(LocalDate data, Integer km, String observacoes) {}
    public record HodometroResumo(
            List<LeituraDto> leituras,
            Integer kmAtualCarro,
            Double kmPorMesMedio,
            Integer totalRodadoUltimosMeses,
            Integer mesesConsiderados
    ) {}

    private LeituraDto toDto(LeituraKm l) {
        return new LeituraDto(l.getId(), l.getData(), l.getKm(), l.getObservacoes());
    }

    @GetMapping
    public HodometroResumo listar() {
        Carro carro = userContextService.getCarroDoUsuarioAtual();
        List<LeituraDto> leituras = repo.findByCarroIdOrderByDataDesc(carro.getId()).stream().map(this::toDto).toList();
        Integer kmAtual = carro.getKmAtual();

        Double kmMes = null;
        Integer totalRodado = null;
        Integer meses = null;
        if (leituras.size() >= 2) {
            LeituraDto mais_recente = leituras.get(0);
            LeituraDto mais_antiga = leituras.get(leituras.size() - 1);
            long dias = ChronoUnit.DAYS.between(mais_antiga.data(), mais_recente.data());
            if (dias > 0) {
                int diff = mais_recente.km() - mais_antiga.km();
                kmMes = (diff / (double) dias) * 30.0;
                totalRodado = diff;
                meses = (int) Math.round(dias / 30.0);
            }
        }

        return new HodometroResumo(leituras, kmAtual, kmMes, totalRodado, meses);
    }

    @PostMapping
    public LeituraDto criar(@RequestBody LeituraRequest req) {
        Carro carro = userContextService.getCarroDoUsuarioAtual();
        LeituraKm l = new LeituraKm();
        l.setCarro(carro);
        l.setData(req.data() != null ? req.data() : LocalDate.now());
        l.setKm(req.km());
        l.setObservacoes(req.observacoes());
        repo.save(l);

        // Atualiza kmAtual do carro se a leitura for >= ao km registrado
        if (carro.getKmAtual() == null || l.getKm() > carro.getKmAtual()) {
            carro.setKmAtual(l.getKm());
            carroRepository.save(carro);
        }

        return toDto(l);
    }

    @PutMapping("/{id}")
    public LeituraDto atualizar(@PathVariable Long id, @RequestBody LeituraRequest req) {
        LeituraKm l = repo.findById(id).orElseThrow();
        Carro carroUsuario = userContextService.getCarroDoUsuarioAtual();
        if (!l.getCarro().getId().equals(carroUsuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao recurso");
        }
        if (req.data() != null) l.setData(req.data());
        if (req.km() != null) l.setKm(req.km());
        l.setObservacoes(req.observacoes());
        return toDto(repo.save(l));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        LeituraKm l = repo.findById(id).orElseThrow();
        Carro carroUsuario = userContextService.getCarroDoUsuarioAtual();
        if (!l.getCarro().getId().equals(carroUsuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao recurso");
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

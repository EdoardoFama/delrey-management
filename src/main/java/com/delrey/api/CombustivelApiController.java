package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.combustivel.Abastecimento;
import com.delrey.combustivel.AbastecimentoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/combustivel")
public class CombustivelApiController {

    private final AbastecimentoRepository repo;
    private final CarroRepository carroRepository;

    public CombustivelApiController(AbastecimentoRepository repo, CarroRepository carroRepository) {
        this.repo = repo;
        this.carroRepository = carroRepository;
    }

    public record AbastecimentoDto(
            Long id, LocalDate data, Integer km, BigDecimal litros,
            BigDecimal valorLitro, BigDecimal valorTotal,
            String tipoCombustivel, String posto, Boolean tanqueCheio,
            String observacoes, BigDecimal kmPorLitro
    ) {}

    public record AbastecimentoRequest(
            LocalDate data, Integer km, BigDecimal litros, BigDecimal valorLitro,
            BigDecimal valorTotal, String tipoCombustivel, String posto,
            Boolean tanqueCheio, String observacoes
    ) {}

    public record CombustivelResumo(
            List<AbastecimentoDto> abastecimentos,
            BigDecimal consumoMedio,
            BigDecimal gastoTotal,
            BigDecimal valorLitroMedio,
            BigDecimal totalLitros,
            Integer totalKm
    ) {}

    @GetMapping
    public CombustivelResumo listar() {
        // ordenado ASC para calcular consumo entre consecutivos
        List<Abastecimento> ordemAsc = repo.findAllByOrderByDataAsc();

        // calcula km/L de cada um (em relação ao anterior tanque cheio)
        List<AbastecimentoDto> dtos = new ArrayList<>();
        Abastecimento anteriorCheio = null;
        BigDecimal somaKmL = BigDecimal.ZERO;
        int kmlCount = 0;

        for (Abastecimento a : ordemAsc) {
            BigDecimal kmL = null;
            if (Boolean.TRUE.equals(a.getTanqueCheio()) && anteriorCheio != null
                    && a.getKm() != null && anteriorCheio.getKm() != null
                    && a.getKm() > anteriorCheio.getKm()
                    && a.getLitros() != null && a.getLitros().compareTo(BigDecimal.ZERO) > 0) {
                int diffKm = a.getKm() - anteriorCheio.getKm();
                kmL = BigDecimal.valueOf(diffKm).divide(a.getLitros(), 2, RoundingMode.HALF_UP);
                somaKmL = somaKmL.add(kmL);
                kmlCount++;
            }
            if (Boolean.TRUE.equals(a.getTanqueCheio())) anteriorCheio = a;

            dtos.add(new AbastecimentoDto(
                    a.getId(), a.getData(), a.getKm(), a.getLitros(),
                    a.getValorLitro(), a.getValorTotal(),
                    a.getTipoCombustivel(), a.getPosto(), a.getTanqueCheio(),
                    a.getObservacoes(), kmL
            ));
        }

        // ordena DESC para exibir mais recente primeiro
        List<AbastecimentoDto> exibicao = new ArrayList<>(dtos);
        exibicao.sort((x, y) -> y.data().compareTo(x.data()));

        BigDecimal consumoMedio = kmlCount > 0
                ? somaKmL.divide(BigDecimal.valueOf(kmlCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal gastoTotal = ordemAsc.stream()
                .map(Abastecimento::getValorTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLitros = ordemAsc.stream()
                .map(Abastecimento::getLitros)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal valorLitroMedio = totalLitros.compareTo(BigDecimal.ZERO) > 0
                ? gastoTotal.divide(totalLitros, 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Integer totalKm = null;
        if (!ordemAsc.isEmpty()) {
            Integer primeiro = ordemAsc.get(0).getKm();
            Integer ultimo = ordemAsc.get(ordemAsc.size() - 1).getKm();
            if (primeiro != null && ultimo != null && ultimo > primeiro) totalKm = ultimo - primeiro;
        }

        return new CombustivelResumo(exibicao, consumoMedio, gastoTotal, valorLitroMedio, totalLitros, totalKm);
    }

    @PostMapping
    public AbastecimentoDto criar(@RequestBody AbastecimentoRequest req) {
        Carro carro = carroRepository.findAll().get(0);
        Abastecimento a = new Abastecimento();
        a.setCarro(carro);
        a.setData(req.data() != null ? req.data() : LocalDate.now());
        a.setKm(req.km());
        a.setLitros(req.litros());
        a.setValorLitro(req.valorLitro());
        a.setValorTotal(req.valorTotal());
        a.setTipoCombustivel(req.tipoCombustivel());
        a.setPosto(req.posto());
        a.setTanqueCheio(req.tanqueCheio() != null ? req.tanqueCheio() : true);
        a.setObservacoes(req.observacoes());
        repo.save(a);

        if (a.getKm() != null && (carro.getKmAtual() == null || a.getKm() > carro.getKmAtual())) {
            carro.setKmAtual(a.getKm());
            carroRepository.save(carro);
        }

        return new AbastecimentoDto(a.getId(), a.getData(), a.getKm(), a.getLitros(),
                a.getValorLitro(), a.getValorTotal(), a.getTipoCombustivel(),
                a.getPosto(), a.getTanqueCheio(), a.getObservacoes(), null);
    }

    @PutMapping("/{id}")
    public AbastecimentoDto atualizar(@PathVariable Long id, @RequestBody AbastecimentoRequest req) {
        Abastecimento a = repo.findById(id).orElseThrow();
        if (req.data() != null) a.setData(req.data());
        a.setKm(req.km());
        if (req.litros() != null) a.setLitros(req.litros());
        if (req.valorLitro() != null) a.setValorLitro(req.valorLitro());
        if (req.valorTotal() != null) a.setValorTotal(req.valorTotal());
        a.setTipoCombustivel(req.tipoCombustivel());
        a.setPosto(req.posto());
        if (req.tanqueCheio() != null) a.setTanqueCheio(req.tanqueCheio());
        a.setObservacoes(req.observacoes());
        repo.save(a);
        return new AbastecimentoDto(a.getId(), a.getData(), a.getKm(), a.getLitros(),
                a.getValorLitro(), a.getValorTotal(), a.getTipoCombustivel(),
                a.getPosto(), a.getTanqueCheio(), a.getObservacoes(), null);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

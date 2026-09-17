package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.combustivel.Abastecimento;
import com.delrey.combustivel.AbastecimentoRepository;
import com.delrey.config.UserContextService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/combustivel")
public class CombustivelApiController {

    private final AbastecimentoRepository repo;
    private final UserContextService userContextService;
    private final CarroRepository carroRepository;

    public CombustivelApiController(AbastecimentoRepository repo,
                                    UserContextService userContextService,
                                    CarroRepository carroRepository) {
        this.repo = repo;
        this.userContextService = userContextService;
        this.carroRepository = carroRepository;
    }

    public record AbastecimentoDto(
            Long id, LocalDate data,
            Integer km, Integer kmAndados,
            BigDecimal litros, BigDecimal valorLitro, BigDecimal valorTotal,
            String tipoCombustivel, String posto, Boolean tanqueCheio,
            String observacoes, BigDecimal kmPorLitro
    ) {}

    /**
     * Request de criação/edição.
     * - valorTotal: obrigatório
     * - km: KM absoluto do hodômetro (obrigatório no 1º abastecimento)
     * - kmAndados: KM percorridos desde o último (usado nos seguintes)
     * - litros: opcional — quando informado junto com valorTotal, valorLitro é calculado
     * - valorLitro: ignorado na entrada (calculado automaticamente)
     */
    public record AbastecimentoRequest(
            LocalDate data, Integer km, Integer kmAndados,
            BigDecimal litros, BigDecimal valorTotal,
            String tipoCombustivel, String posto,
            Boolean tanqueCheio, String observacoes
    ) {}

    public record CombustivelResumo(
            List<AbastecimentoDto> abastecimentos,
            BigDecimal consumoMedio,
            BigDecimal gastoTotal,
            BigDecimal valorLitroMedio,
            BigDecimal totalLitros,
            Integer totalKm,
            Integer kmAtualCalculado,
            List<String> postos,
            List<String> tipos
    ) {}

    @GetMapping
    public CombustivelResumo listar(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) String posto,
            @RequestParam(required = false) String tipo
    ) {
        Carro carro = userContextService.getCarroDoUsuarioAtual();
        // Ordenado ASC para calcular consumo entre consecutivos e km acumulado
        List<Abastecimento> ordemAsc = repo.findByCarroIdOrderByDataAsc(carro.getId());

        // Calcular km absoluto acumulado para registros que só têm kmAndados
        recalcularKmAbsoluto(ordemAsc);

        // Calcula km/L de cada abastecimento
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

            dtos.add(toDto(a, kmL));
        }

        // km atual calculado: km do último abastecimento que tem km absoluto
        Integer kmAtualCalculado = ordemAsc.stream()
                .filter(a -> a.getKm() != null)
                .reduce((first, second) -> second)
                .map(Abastecimento::getKm)
                .orElse(null);

        // Listas de postos e tipos disponíveis para filtros
        List<String> postos = ordemAsc.stream()
                .map(Abastecimento::getPosto)
                .filter(p -> p != null && !p.isBlank())
                .distinct().sorted().collect(Collectors.toList());

        List<String> tipos = ordemAsc.stream()
                .map(Abastecimento::getTipoCombustivel)
                .filter(t -> t != null && !t.isBlank())
                .distinct().sorted().collect(Collectors.toList());

        // Aplica filtros sobre a lista completa para exibição
        List<AbastecimentoDto> filtrados = new ArrayList<>(dtos);
        if (ano != null) {
            filtrados = filtrados.stream()
                    .filter(d -> d.data().getYear() == ano)
                    .collect(Collectors.toList());
        }
        if (mes != null && mes >= 1 && mes <= 12) {
            filtrados = filtrados.stream()
                    .filter(d -> d.data().getMonthValue() == mes)
                    .collect(Collectors.toList());
        }
        if (posto != null && !posto.isBlank()) {
            String postoLower = posto.toLowerCase();
            filtrados = filtrados.stream()
                    .filter(d -> d.posto() != null && d.posto().toLowerCase().contains(postoLower))
                    .collect(Collectors.toList());
        }
        if (tipo != null && !tipo.isBlank()) {
            filtrados = filtrados.stream()
                    .filter(d -> tipo.equalsIgnoreCase(d.tipoCombustivel()))
                    .collect(Collectors.toList());
        }

        // Ordena DESC para exibição
        filtrados.sort((x, y) -> y.data().compareTo(x.data()));

        // Totais calculados sobre a lista FILTRADA
        BigDecimal gastoTotal = filtrados.stream()
                .map(AbastecimentoDto::valorTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLitros = filtrados.stream()
                .map(AbastecimentoDto::litros)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal valorLitroMedio = totalLitros.compareTo(BigDecimal.ZERO) > 0
                ? gastoTotal.divide(totalLitros, 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal consumoMedio = kmlCount > 0
                ? somaKmL.divide(BigDecimal.valueOf(kmlCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // totalKm com base na lista filtrada
        Integer totalKm = null;
        List<Integer> kmsComValor = filtrados.stream()
                .filter(d -> d.km() != null)
                .map(AbastecimentoDto::km)
                .sorted()
                .collect(Collectors.toList());
        if (kmsComValor.size() >= 2) {
            int min = kmsComValor.get(0);
            int max = kmsComValor.get(kmsComValor.size() - 1);
            if (max > min) totalKm = max - min;
        }

        return new CombustivelResumo(filtrados, consumoMedio, gastoTotal, valorLitroMedio,
                totalLitros, totalKm, kmAtualCalculado, postos, tipos);
    }

    @PostMapping
    public AbastecimentoDto criar(@RequestBody AbastecimentoRequest req) {
        if (req.valorTotal() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "valorTotal é obrigatório");
        }

        Carro carro = userContextService.getCarroDoUsuarioAtual();
        List<Abastecimento> existentes = repo.findByCarroIdOrderByDataAsc(carro.getId());
        recalcularKmAbsoluto(existentes);

        Abastecimento a = new Abastecimento();
        a.setCarro(carro);
        a.setData(req.data() != null ? req.data() : LocalDate.now());
        a.setValorTotal(req.valorTotal());
        a.setLitros(req.litros());
        a.setTipoCombustivel(req.tipoCombustivel());
        a.setPosto(req.posto());
        a.setTanqueCheio(req.tanqueCheio() != null ? req.tanqueCheio() : true);
        a.setObservacoes(req.observacoes());

        // Calcular km absoluto
        if (req.km() != null) {
            // Km absoluto informado diretamente
            a.setKm(req.km());
            a.setKmAndados(null);
        } else if (req.kmAndados() != null && !existentes.isEmpty()) {
            // Km relativo: soma ao último km absoluto conhecido
            Integer ultimoKm = existentes.stream()
                    .filter(e -> e.getKm() != null)
                    .reduce((first, second) -> second)
                    .map(Abastecimento::getKm)
                    .orElse(null);
            if (ultimoKm != null) {
                a.setKm(ultimoKm + req.kmAndados());
            }
            a.setKmAndados(req.kmAndados());
        }

        // Calcular valor por litro automaticamente
        if (req.litros() != null && req.litros().compareTo(BigDecimal.ZERO) > 0) {
            a.setValorLitro(req.valorTotal().divide(req.litros(), 3, RoundingMode.HALF_UP));
        }

        repo.save(a);

        // Atualiza km do carro se necessário
        if (a.getKm() != null && (carro.getKmAtual() == null || a.getKm() > carro.getKmAtual())) {
            carro.setKmAtual(a.getKm());
            carroRepository.save(carro);
        }

        return toDto(a, null);
    }

    @PutMapping("/{id}")
    public AbastecimentoDto atualizar(@PathVariable Long id, @RequestBody AbastecimentoRequest req) {
        Abastecimento a = repo.findById(id).orElseThrow();
        Carro carroUsuario = userContextService.getCarroDoUsuarioAtual();
        if (!a.getCarro().getId().equals(carroUsuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao recurso");
        }

        if (req.data() != null) a.setData(req.data());
        a.setValorTotal(req.valorTotal() != null ? req.valorTotal() : a.getValorTotal());
        a.setLitros(req.litros());
        a.setTipoCombustivel(req.tipoCombustivel());
        a.setPosto(req.posto());
        if (req.tanqueCheio() != null) a.setTanqueCheio(req.tanqueCheio());
        a.setObservacoes(req.observacoes());

        // Atualizar km
        if (req.km() != null) {
            a.setKm(req.km());
            a.setKmAndados(null);
        } else if (req.kmAndados() != null) {
            a.setKmAndados(req.kmAndados());
            // Recalcular km absoluto baseado nos demais
            List<Abastecimento> todos = repo.findByCarroIdOrderByDataAsc(carroUsuario.getId());
            recalcularKmAbsoluto(todos);
            todos.stream().filter(e -> e.getId().equals(id)).findFirst()
                    .ifPresent(e -> a.setKm(e.getKm()));
        }

        // Recalcular valor por litro
        if (a.getLitros() != null && a.getLitros().compareTo(BigDecimal.ZERO) > 0
                && a.getValorTotal() != null) {
            a.setValorLitro(a.getValorTotal().divide(a.getLitros(), 3, RoundingMode.HALF_UP));
        } else {
            a.setValorLitro(null);
        }

        repo.save(a);
        return toDto(a, null);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Abastecimento a = repo.findById(id).orElseThrow();
        Carro carroUsuario = userContextService.getCarroDoUsuarioAtual();
        if (!a.getCarro().getId().equals(carroUsuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao recurso");
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- helpers ----

    private AbastecimentoDto toDto(Abastecimento a, BigDecimal kmL) {
        return new AbastecimentoDto(
                a.getId(), a.getData(), a.getKm(), a.getKmAndados(),
                a.getLitros(), a.getValorLitro(), a.getValorTotal(),
                a.getTipoCombustivel(), a.getPosto(), a.getTanqueCheio(),
                a.getObservacoes(), kmL
        );
    }

    /**
     * Para abastecimentos que têm kmAndados mas não têm km absoluto,
     * calcula o km absoluto acumulando a partir do anterior.
     * Modifica a lista in-place (sem salvar no banco).
     */
    private void recalcularKmAbsoluto(List<Abastecimento> ordemAsc) {
        Integer ultimoKmAbsoluto = null;
        for (Abastecimento a : ordemAsc) {
            if (a.getKm() != null) {
                ultimoKmAbsoluto = a.getKm();
            } else if (a.getKmAndados() != null && ultimoKmAbsoluto != null) {
                // Calcula km absoluto em memória (não persiste)
                a.setKm(ultimoKmAbsoluto + a.getKmAndados());
                ultimoKmAbsoluto = a.getKm();
            }
        }
    }
}

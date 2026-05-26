package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.peca.Peca;
import com.delrey.peca.PecaRepository;
import com.delrey.troca.Troca;
import com.delrey.troca.TrocaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alertas")
public class AlertaApiController {

    private final TrocaRepository trocaRepository;
    private final PecaRepository pecaRepository;
    private final CarroRepository carroRepository;

    public AlertaApiController(TrocaRepository trocaRepository, PecaRepository pecaRepository, CarroRepository carroRepository) {
        this.trocaRepository = trocaRepository;
        this.pecaRepository = pecaRepository;
        this.carroRepository = carroRepository;
    }

    // status: ATRASADO, PROXIMO, OK
    public record AlertaManutencao(
            Long pecaId, String pecaNome, String categoriaNome,
            Integer intervaloKm, Integer intervaloMeses,
            LocalDate ultimaTroca, Integer ultimoKm,
            LocalDate proximaPorData, Integer proximoPorKm,
            Integer diasParaProximo, Integer kmParaProximo,
            String status
    ) {}

    public record GarantiaAtiva(
            Long trocaId, String pecaNome, String categoriaNome,
            LocalDate dataTroca, Integer garantiaMeses,
            LocalDate validaAte, Integer diasRestantes,
            BigDecimal valor, BigDecimal maoDeObra, String fornecedor
    ) {}

    @GetMapping("/manutencao")
    public List<AlertaManutencao> manutencao() {
        Carro carro = carroRepository.findAll().stream().findFirst().orElse(null);
        Integer kmAtual = carro != null ? carro.getKmAtual() : null;
        LocalDate hoje = LocalDate.now();

        Map<Long, Troca> ultimaPorPeca = trocaRepository.ultimaTrocaDeCadaPeca().stream()
                .collect(Collectors.toMap(t -> t.getPeca().getId(), t -> t, (a, b) -> a));

        List<AlertaManutencao> alertas = new ArrayList<>();
        for (Peca peca : pecaRepository.findAllByOrderByNome()) {
            Integer intervaloKm = peca.getIntervaloKm();
            Integer intervaloMeses = peca.getIntervaloMeses();
            if (intervaloKm == null && intervaloMeses == null) continue;

            Troca ultima = ultimaPorPeca.get(peca.getId());
            LocalDate ultimaData = ultima != null ? ultima.getDataTroca() : null;
            Integer ultimoKm = ultima != null ? ultima.getKm() : null;

            LocalDate proximaPorData = null;
            Integer diasParaProximo = null;
            if (intervaloMeses != null && ultimaData != null) {
                proximaPorData = ultimaData.plusMonths(intervaloMeses);
                diasParaProximo = (int) ChronoUnit.DAYS.between(hoje, proximaPorData);
            }

            Integer proximoPorKm = null;
            Integer kmParaProximo = null;
            if (intervaloKm != null && ultimoKm != null && kmAtual != null) {
                proximoPorKm = ultimoKm + intervaloKm;
                kmParaProximo = proximoPorKm - kmAtual;
            }

            String status = "OK";
            boolean atrasado = (diasParaProximo != null && diasParaProximo < 0) ||
                                (kmParaProximo != null && kmParaProximo < 0);
            boolean proximo = !atrasado && (
                    (diasParaProximo != null && diasParaProximo <= 30) ||
                    (kmParaProximo != null && kmParaProximo <= 1000)
            );
            if (atrasado) status = "ATRASADO";
            else if (proximo) status = "PROXIMO";

            // só inclui se nunca foi trocada (sem dado) ou se tem algum sinal
            if (ultima == null) status = "SEM_REGISTRO";

            alertas.add(new AlertaManutencao(
                    peca.getId(), peca.getNome(), peca.getCategoria().getNome(),
                    intervaloKm, intervaloMeses, ultimaData, ultimoKm,
                    proximaPorData, proximoPorKm,
                    diasParaProximo, kmParaProximo, status
            ));
        }

        // ordena: ATRASADO > PROXIMO > SEM_REGISTRO > OK
        Map<String, Integer> ordem = Map.of("ATRASADO", 0, "PROXIMO", 1, "SEM_REGISTRO", 2, "OK", 3);
        alertas.sort(Comparator.comparingInt(a -> ordem.getOrDefault(a.status(), 99)));
        return alertas;
    }

    @GetMapping("/garantia")
    public List<GarantiaAtiva> garantia() {
        LocalDate hoje = LocalDate.now();
        List<GarantiaAtiva> ativas = new ArrayList<>();
        for (Troca t : trocaRepository.servicosComGarantiaConfigurada()) {
            LocalDate validaAte = t.getDataTroca().plusMonths(t.getGarantiaMeses());
            if (validaAte.isBefore(hoje)) continue;
            int dias = (int) ChronoUnit.DAYS.between(hoje, validaAte);
            ativas.add(new GarantiaAtiva(
                    t.getId(),
                    t.getPeca().getNome(),
                    t.getPeca().getCategoria().getNome(),
                    t.getDataTroca(),
                    t.getGarantiaMeses(),
                    validaAte,
                    dias,
                    t.getValor(),
                    t.getMaoDeObra(),
                    t.getFornecedor()
            ));
        }
        ativas.sort(Comparator.comparingInt(GarantiaAtiva::diasRestantes));
        return ativas;
    }
}

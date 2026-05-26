package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.combustivel.Abastecimento;
import com.delrey.combustivel.AbastecimentoRepository;
import com.delrey.hodometro.LeituraKm;
import com.delrey.hodometro.LeituraKmRepository;
import com.delrey.peca.Peca;
import com.delrey.peca.PecaRepository;
import com.delrey.troca.Troca;
import com.delrey.troca.TrocaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projecao")
public class ProjecaoApiController {

    private final TrocaRepository trocaRepository;
    private final PecaRepository pecaRepository;
    private final CarroRepository carroRepository;
    private final LeituraKmRepository leituraRepository;
    private final AbastecimentoRepository abastRepository;

    public ProjecaoApiController(TrocaRepository t, PecaRepository p, CarroRepository c,
                                  LeituraKmRepository l, AbastecimentoRepository a) {
        this.trocaRepository = t;
        this.pecaRepository = p;
        this.carroRepository = c;
        this.leituraRepository = l;
        this.abastRepository = a;
    }

    public record ManutencaoPrevista(
            Long pecaId, String pecaNome, String categoriaNome,
            LocalDate previsaoData, Integer previsaoKm,
            String motivo, BigDecimal custoEstimado, String fonteCusto
    ) {}

    public record PeriodoProjetado(
            int meses,
            BigDecimal combustivelPrevisto,
            Integer kmPrevistos,
            BigDecimal manutencoesPrevistas,
            BigDecimal baselineHistorica,
            BigDecimal totalEstimado,
            List<ManutencaoPrevista> manutencoes
    ) {}

    public record ProjecaoResponse(
            Double ritmoKmPorMes,
            BigDecimal consumoMedio,
            BigDecimal valorLitroMedio,
            BigDecimal mediaMensalHistorica,
            int mesesHistorico,
            Integer kmAtualCarro,
            List<PeriodoProjetado> periodos
    ) {}

    @GetMapping
    public ProjecaoResponse get(@RequestParam(required = false) Integer mesesHistorico) {
        int N = mesesHistorico != null && mesesHistorico > 0 ? mesesHistorico : 12;
        LocalDate hoje = LocalDate.now();
        LocalDate inicioHistorico = hoje.minusMonths(N);

        // Ritmo de uso (km/mês) — derivado das leituras
        List<LeituraKm> leituras = leituraRepository.findAllByOrderByDataDesc();
        Double ritmoKmPorMes = null;
        if (leituras.size() >= 2) {
            LeituraKm recente = leituras.get(0);
            LeituraKm antiga = leituras.get(leituras.size() - 1);
            long dias = ChronoUnit.DAYS.between(antiga.getData(), recente.getData());
            if (dias > 0) {
                int diff = recente.getKm() - antiga.getKm();
                ritmoKmPorMes = (diff / (double) dias) * 30.0;
            }
        }

        // Consumo + preço médio combustível
        List<Abastecimento> abasts = abastRepository.findAllByOrderByDataAsc();
        BigDecimal consumoMedio = calcularConsumoMedio(abasts);
        BigDecimal valorLitroMedio = calcularValorLitroMedio(abasts);

        // Média mensal histórica (gastos totais)
        BigDecimal totalHistorico = nz(trocaRepository.totalGastoNoPeriodo(inicioHistorico, hoje));
        BigDecimal mediaMensal = totalHistorico.divide(BigDecimal.valueOf(N), 2, RoundingMode.HALF_UP);

        // Carro
        Carro carro = carroRepository.findAll().stream().findFirst().orElse(null);
        Integer kmAtual = carro != null ? carro.getKmAtual() : null;

        // Últimas trocas por peça (para usar no custo estimado e na previsão)
        Map<Long, Troca> ultimaPorPeca = trocaRepository.ultimaTrocaDeCadaPeca().stream()
                .collect(Collectors.toMap(t -> t.getPeca().getId(), t -> t, (a, b) -> a));

        // Calcula períodos de 3, 6 e 12 meses
        List<PeriodoProjetado> periodos = new ArrayList<>();
        for (int meses : new int[]{3, 6, 12}) {
            periodos.add(calcularPeriodo(meses, ritmoKmPorMes, consumoMedio, valorLitroMedio,
                    mediaMensal, kmAtual, ultimaPorPeca, hoje));
        }

        return new ProjecaoResponse(
                ritmoKmPorMes,
                consumoMedio,
                valorLitroMedio,
                mediaMensal,
                N,
                kmAtual,
                periodos
        );
    }

    private PeriodoProjetado calcularPeriodo(
            int meses, Double ritmoKmPorMes,
            BigDecimal consumoMedio, BigDecimal valorLitroMedio,
            BigDecimal mediaMensal, Integer kmAtual,
            Map<Long, Troca> ultimaPorPeca, LocalDate hoje
    ) {
        // Combustível previsto
        BigDecimal combustivel = BigDecimal.ZERO;
        Integer kmPrevistos = null;
        if (ritmoKmPorMes != null && consumoMedio.compareTo(BigDecimal.ZERO) > 0
                && valorLitroMedio.compareTo(BigDecimal.ZERO) > 0) {
            kmPrevistos = (int) Math.round(ritmoKmPorMes * meses);
            BigDecimal litros = BigDecimal.valueOf(kmPrevistos)
                    .divide(consumoMedio, 4, RoundingMode.HALF_UP);
            combustivel = litros.multiply(valorLitroMedio).setScale(2, RoundingMode.HALF_UP);
        }

        // Manutenções previstas (alertas que vão vencer dentro do período)
        List<ManutencaoPrevista> manutencoes = new ArrayList<>();
        LocalDate limite = hoje.plusMonths(meses);
        Integer kmLimite = (kmAtual != null && kmPrevistos != null) ? kmAtual + kmPrevistos : null;

        for (Peca peca : pecaRepository.findAll()) {
            Integer intervaloKm = peca.getIntervaloKm();
            Integer intervaloMeses = peca.getIntervaloMeses();
            if (intervaloKm == null && intervaloMeses == null) continue;

            Troca ultima = ultimaPorPeca.get(peca.getId());
            if (ultima == null) continue; // sem registro, não dá pra prever

            LocalDate proxData = null;
            Integer proxKm = null;
            if (intervaloMeses != null) proxData = ultima.getDataTroca().plusMonths(intervaloMeses);
            if (intervaloKm != null && ultima.getKm() != null) proxKm = ultima.getKm() + intervaloKm;

            boolean dentroPeriodoData = proxData != null && !proxData.isAfter(limite);
            boolean dentroPeriodoKm = proxKm != null && kmLimite != null && proxKm <= kmLimite;
            if (!dentroPeriodoData && !dentroPeriodoKm) continue;

            // Estima custo: usa último valor pago naquela peça
            BigDecimal custo = ((ultima.getValor() != null ? ultima.getValor() : BigDecimal.ZERO))
                    .add(ultima.getMaoDeObra() != null ? ultima.getMaoDeObra() : BigDecimal.ZERO);
            String fonte = "Último valor pago";
            if (custo.compareTo(BigDecimal.ZERO) == 0) {
                fonte = "Sem histórico de custo";
            }

            String motivo = dentroPeriodoData && dentroPeriodoKm
                    ? "Por data e km"
                    : dentroPeriodoData ? "Por data" : "Por km";

            manutencoes.add(new ManutencaoPrevista(
                    peca.getId(), peca.getNome(), peca.getCategoria().getNome(),
                    proxData, proxKm, motivo, custo, fonte
            ));
        }

        // Ordena: data mais próxima primeiro
        manutencoes.sort((a, b) -> {
            if (a.previsaoData() == null) return 1;
            if (b.previsaoData() == null) return -1;
            return a.previsaoData().compareTo(b.previsaoData());
        });

        BigDecimal totalManutencoes = manutencoes.stream()
                .map(ManutencaoPrevista::custoEstimado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal baseline = mediaMensal.multiply(BigDecimal.valueOf(meses)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = combustivel.add(totalManutencoes);

        return new PeriodoProjetado(
                meses,
                combustivel,
                kmPrevistos,
                totalManutencoes,
                baseline,
                total,
                manutencoes
        );
    }

    private BigDecimal calcularConsumoMedio(List<Abastecimento> ordemAsc) {
        Abastecimento anteriorCheio = null;
        BigDecimal soma = BigDecimal.ZERO;
        int n = 0;
        for (Abastecimento a : ordemAsc) {
            if (Boolean.TRUE.equals(a.getTanqueCheio()) && anteriorCheio != null
                    && a.getKm() != null && anteriorCheio.getKm() != null
                    && a.getKm() > anteriorCheio.getKm()
                    && a.getLitros() != null && a.getLitros().compareTo(BigDecimal.ZERO) > 0) {
                int diff = a.getKm() - anteriorCheio.getKm();
                BigDecimal kmL = BigDecimal.valueOf(diff).divide(a.getLitros(), 2, RoundingMode.HALF_UP);
                soma = soma.add(kmL);
                n++;
            }
            if (Boolean.TRUE.equals(a.getTanqueCheio())) anteriorCheio = a;
        }
        return n > 0 ? soma.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private BigDecimal calcularValorLitroMedio(List<Abastecimento> abasts) {
        BigDecimal totalValor = abasts.stream()
                .map(Abastecimento::getValorTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLitros = abasts.stream()
                .map(Abastecimento::getLitros)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalLitros.compareTo(BigDecimal.ZERO) > 0
                ? totalValor.divide(totalLitros, 3, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
    }

    private static BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}

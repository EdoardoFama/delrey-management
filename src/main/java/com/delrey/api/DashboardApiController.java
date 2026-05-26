package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardApiController {

    private final TrocaRepository trocaRepository;
    private final CarroRepository carroRepository;

    public DashboardApiController(TrocaRepository trocaRepository, CarroRepository carroRepository) {
        this.trocaRepository = trocaRepository;
        this.carroRepository = carroRepository;
    }

    record CarroDto(Long id, String modelo, Integer ano, String motor, String versao, Integer kmAtual) {}
    record TrocaSummary(Long id, String pecaNome, String categoriaNome, LocalDate dataTroca, BigDecimal valor, BigDecimal maoDeObra, Integer km) {}
    record CategoriaTotal(String categoria, BigDecimal total) {}
    record DashboardResponse(
            CarroDto carro,
            int ano,
            Integer mes,
            BigDecimal totalPeriodo,
            BigDecimal totalCompras,
            BigDecimal totalServicos,
            List<TrocaSummary> ultimasTrocas,
            List<CategoriaTotal> porCategoria,
            List<CategoriaTotal> porCategoriaCompras,
            List<CategoriaTotal> porCategoriaServicos,
            List<Integer> anosDisponiveis
    ) {}

    @GetMapping
    public DashboardResponse get(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes
    ) {
        int anoFiltro = ano != null ? ano : Year.now().getValue();
        LocalDate inicio;
        LocalDate fim;
        if (mes != null && mes >= 1 && mes <= 12) {
            inicio = LocalDate.of(anoFiltro, mes, 1);
            fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        } else {
            inicio = LocalDate.of(anoFiltro, 1, 1);
            fim = LocalDate.of(anoFiltro, 12, 31);
        }

        BigDecimal totalPeriodo = nz(trocaRepository.totalGastoNoPeriodo(inicio, fim));
        BigDecimal totalCompras = nz(trocaRepository.totalGastoNoPeriodoPorTipo(inicio, fim, "COMPRA"));
        BigDecimal totalServicos = nz(trocaRepository.totalGastoNoPeriodoPorTipo(inicio, fim, "SERVICO"));

        Carro carro = carroRepository.findAll().stream().findFirst().orElse(null);
        CarroDto carroDto = carro == null ? null
                : new CarroDto(carro.getId(), carro.getModelo(), carro.getAno(), carro.getMotor(), carro.getVersao(), carro.getKmAtual());

        List<TrocaSummary> ultimasTrocas = trocaRepository.findTop5ByDataTrocaBetweenOrderByDataTrocaDesc(inicio, fim).stream()
                .map(t -> new TrocaSummary(t.getId(), t.getPeca().getNome(), t.getPeca().getCategoria().getNome(),
                        t.getDataTroca(), t.getValor(), t.getMaoDeObra(), t.getKm()))
                .toList();

        List<CategoriaTotal> porCategoria = trocaRepository.totalPorCategoriaNoPeriodo(inicio, fim).stream()
                .map(row -> new CategoriaTotal((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<CategoriaTotal> porCategoriaCompras = trocaRepository.totalPorCategoriaNoPeriodoPorTipo(inicio, fim, "COMPRA").stream()
                .map(row -> new CategoriaTotal((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<CategoriaTotal> porCategoriaServicos = trocaRepository.totalPorCategoriaNoPeriodoPorTipo(inicio, fim, "SERVICO").stream()
                .map(row -> new CategoriaTotal((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<Integer> anosDisponiveis = trocaRepository.anosComRegistros();
        if (anosDisponiveis.isEmpty()) {
            anosDisponiveis = List.of(Year.now().getValue());
        }

        return new DashboardResponse(
                carroDto,
                anoFiltro,
                mes,
                totalPeriodo,
                totalCompras,
                totalServicos,
                ultimasTrocas,
                porCategoria,
                porCategoriaCompras,
                porCategoriaServicos,
                anosDisponiveis
        );
    }

    private static BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}

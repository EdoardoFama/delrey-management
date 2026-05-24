package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
            BigDecimal totalAno,
            BigDecimal totalCompras,
            BigDecimal totalServicos,
            BigDecimal totalMes,
            int ano,
            List<TrocaSummary> ultimasTrocas,
            List<CategoriaTotal> porCategoria,
            List<CategoriaTotal> porCategoriaCompras,
            List<CategoriaTotal> porCategoriaServicos
    ) {}

    @GetMapping
    public DashboardResponse get() {
        int ano = Year.now().getValue();
        LocalDate inicioAno = LocalDate.of(ano, 1, 1);
        LocalDate fimAno = LocalDate.of(ano, 12, 31);
        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);

        BigDecimal totalAno = nz(trocaRepository.totalGastoNoPeriodo(inicioAno, fimAno));
        BigDecimal totalCompras = nz(trocaRepository.totalGastoNoPeriodoPorTipo(inicioAno, fimAno, "COMPRA"));
        BigDecimal totalServicos = nz(trocaRepository.totalGastoNoPeriodoPorTipo(inicioAno, fimAno, "SERVICO"));
        BigDecimal totalMes = nz(trocaRepository.totalGastoNoPeriodo(inicioMes, LocalDate.now()));

        Carro carro = carroRepository.findAll().stream().findFirst().orElse(null);
        CarroDto carroDto = carro == null ? null
                : new CarroDto(carro.getId(), carro.getModelo(), carro.getAno(), carro.getMotor(), carro.getVersao(), carro.getKmAtual());

        List<TrocaSummary> ultimasTrocas = trocaRepository.findTop5ByOrderByDataTrocaDesc().stream()
                .map(t -> new TrocaSummary(t.getId(), t.getPeca().getNome(), t.getPeca().getCategoria().getNome(),
                        t.getDataTroca(), t.getValor(), t.getMaoDeObra(), t.getKm()))
                .toList();

        List<CategoriaTotal> porCategoria = trocaRepository.totalPorCategoriaNoAno(ano).stream()
                .map(row -> new CategoriaTotal((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<CategoriaTotal> porCategoriaCompras = trocaRepository.totalPorCategoriaNoAnoPorTipo(ano, "COMPRA").stream()
                .map(row -> new CategoriaTotal((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<CategoriaTotal> porCategoriaServicos = trocaRepository.totalPorCategoriaNoAnoPorTipo(ano, "SERVICO").stream()
                .map(row -> new CategoriaTotal((String) row[0], (BigDecimal) row[1]))
                .toList();

        return new DashboardResponse(
                carroDto,
                totalAno,
                totalCompras,
                totalServicos,
                totalMes,
                ano,
                ultimasTrocas,
                porCategoria,
                porCategoriaCompras,
                porCategoriaServicos
        );
    }

    private static BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}

package com.delrey.web;

import com.delrey.carro.CarroRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;

@Controller
public class DashboardController {

    private final TrocaRepository trocaRepository;
    private final CarroRepository carroRepository;

    public DashboardController(TrocaRepository trocaRepository, CarroRepository carroRepository) {
        this.trocaRepository = trocaRepository;
        this.carroRepository = carroRepository;
    }

    @GetMapping("/")
    public String dashboard(Model model) {
        int ano = Year.now().getValue();
        LocalDate inicioAno = LocalDate.of(ano, 1, 1);
        LocalDate fimAno = LocalDate.of(ano, 12, 31);
        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);

        BigDecimal totalAno = trocaRepository.totalGastoNoPeriodo(inicioAno, fimAno);
        BigDecimal totalMes = trocaRepository.totalGastoNoPeriodo(inicioMes, LocalDate.now());

        model.addAttribute("totalAno", totalAno != null ? totalAno : BigDecimal.ZERO);
        model.addAttribute("totalMes", totalMes != null ? totalMes : BigDecimal.ZERO);
        model.addAttribute("ano", ano);
        model.addAttribute("ultimasTrocas", trocaRepository.findTop5ByOrderByDataTrocaDesc());
        model.addAttribute("porCategoria", trocaRepository.totalPorCategoriaNoAno(ano));
        model.addAttribute("carro", carroRepository.findAll().stream().findFirst().orElse(null));

        return "dashboard";
    }
}

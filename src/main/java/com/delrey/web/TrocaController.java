package com.delrey.web;

import com.delrey.carro.CarroRepository;
import com.delrey.peca.PecaRepository;
import com.delrey.troca.Troca;
import com.delrey.troca.TrocaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Controller
@RequestMapping("/trocas")
public class TrocaController {

    private final TrocaRepository trocaRepository;
    private final PecaRepository pecaRepository;
    private final CarroRepository carroRepository;

    public TrocaController(TrocaRepository trocaRepository, PecaRepository pecaRepository, CarroRepository carroRepository) {
        this.trocaRepository = trocaRepository;
        this.pecaRepository = pecaRepository;
        this.carroRepository = carroRepository;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("trocas", trocaRepository.findAllByOrderByDataTrocaDesc());
        return "trocas/lista";
    }

    @GetMapping("/nova")
    public String novaForm(Model model) {
        Troca troca = new Troca();
        troca.setDataTroca(LocalDate.now());
        troca.setValor(BigDecimal.ZERO);
        troca.setMaoDeObra(BigDecimal.ZERO);
        model.addAttribute("troca", troca);
        model.addAttribute("pecas", pecaRepository.findAllByOrderByNome());
        return "trocas/form";
    }

    @PostMapping
    public String salvar(@ModelAttribute Troca troca,
                         @RequestParam Long pecaId) {
        troca.setCarro(carroRepository.findAll().get(0));
        troca.setPeca(pecaRepository.findById(pecaId).orElseThrow());
        trocaRepository.save(troca);

        var carro = troca.getCarro();
        if (troca.getKm() != null && (carro.getKmAtual() == null || troca.getKm() > carro.getKmAtual())) {
            carro.setKmAtual(troca.getKm());
            carroRepository.save(carro);
        }

        return "redirect:/trocas";
    }
}

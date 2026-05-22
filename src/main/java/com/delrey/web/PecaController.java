package com.delrey.web;

import com.delrey.peca.PecaRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/pecas")
public class PecaController {

    private final PecaRepository pecaRepository;
    private final TrocaRepository trocaRepository;

    public PecaController(PecaRepository pecaRepository, TrocaRepository trocaRepository) {
        this.pecaRepository = pecaRepository;
        this.trocaRepository = trocaRepository;
    }

    @GetMapping
    public String listar(@RequestParam(required = false) String q, Model model) {
        var pecas = (q == null || q.isBlank())
                ? pecaRepository.findAllByOrderByNome()
                : pecaRepository.findByNomeContainingIgnoreCaseOrderByNome(q);
        model.addAttribute("pecas", pecas);
        model.addAttribute("q", q);
        return "pecas/lista";
    }

    @GetMapping("/{id}")
    public String detalhe(@PathVariable Long id, Model model) {
        model.addAttribute("peca", pecaRepository.findById(id).orElseThrow());
        model.addAttribute("historico", trocaRepository.historicoPorPeca(id));
        return "pecas/detalhe";
    }
}

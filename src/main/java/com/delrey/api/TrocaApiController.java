package com.delrey.api;

import com.delrey.carro.CarroRepository;
import com.delrey.peca.PecaRepository;
import com.delrey.troca.Troca;
import com.delrey.troca.TrocaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trocas")
public class TrocaApiController {

    private final TrocaRepository trocaRepository;
    private final PecaRepository pecaRepository;
    private final CarroRepository carroRepository;

    public TrocaApiController(TrocaRepository trocaRepository, PecaRepository pecaRepository, CarroRepository carroRepository) {
        this.trocaRepository = trocaRepository;
        this.pecaRepository = pecaRepository;
        this.carroRepository = carroRepository;
    }

    record TrocaDto(Long id, Long pecaId, String pecaNome, String categoriaNome, LocalDate dataTroca,
                    Integer km, BigDecimal valor, BigDecimal maoDeObra, String fornecedor,
                    Integer garantiaMeses, String observacoes) {}

    record TrocaRequest(Long pecaId, LocalDate dataTroca, Integer km, BigDecimal valor,
                        BigDecimal maoDeObra, String fornecedor, Integer garantiaMeses, String observacoes) {}

    private TrocaDto toDto(Troca t) {
        return new TrocaDto(t.getId(), t.getPeca().getId(), t.getPeca().getNome(),
                t.getPeca().getCategoria().getNome(), t.getDataTroca(), t.getKm(),
                t.getValor(), t.getMaoDeObra(), t.getFornecedor(), t.getGarantiaMeses(), t.getObservacoes());
    }

    @GetMapping
    public List<TrocaDto> listar() {
        return trocaRepository.findAllByOrderByDataTrocaDesc().stream().map(this::toDto).toList();
    }

    @PostMapping
    public TrocaDto salvar(@RequestBody TrocaRequest req) {
        Troca troca = new Troca();
        troca.setCarro(carroRepository.findAll().get(0));
        troca.setPeca(pecaRepository.findById(req.pecaId()).orElseThrow());
        troca.setDataTroca(req.dataTroca() != null ? req.dataTroca() : LocalDate.now());
        troca.setKm(req.km());
        troca.setValor(req.valor() != null ? req.valor() : BigDecimal.ZERO);
        troca.setMaoDeObra(req.maoDeObra() != null ? req.maoDeObra() : BigDecimal.ZERO);
        troca.setFornecedor(req.fornecedor());
        troca.setGarantiaMeses(req.garantiaMeses());
        troca.setObservacoes(req.observacoes());
        trocaRepository.save(troca);

        var carro = troca.getCarro();
        if (troca.getKm() != null && (carro.getKmAtual() == null || troca.getKm() > carro.getKmAtual())) {
            carro.setKmAtual(troca.getKm());
            carroRepository.save(carro);
        }

        return toDto(troca);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        trocaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

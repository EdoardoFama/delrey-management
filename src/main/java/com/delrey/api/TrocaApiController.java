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

    record TrocaDto(Long id, String tipo, Long pecaId, String pecaNome, String categoriaNome,
                    LocalDate dataTroca, Integer km, BigDecimal valor, BigDecimal maoDeObra,
                    String fornecedor, Integer garantiaMeses, String observacoes) {}

    record TrocaRequest(String tipo, Long pecaId, LocalDate dataTroca, Integer km,
                        BigDecimal valor, BigDecimal maoDeObra, String fornecedor,
                        Integer garantiaMeses, String observacoes) {}

    private TrocaDto toDto(Troca t) {
        return new TrocaDto(t.getId(), t.getTipo(), t.getPeca().getId(), t.getPeca().getNome(),
                t.getPeca().getCategoria().getNome(), t.getDataTroca(), t.getKm(),
                t.getValor(), t.getMaoDeObra(), t.getFornecedor(), t.getGarantiaMeses(), t.getObservacoes());
    }

    @GetMapping
    public List<TrocaDto> listar(@RequestParam(required = false) String tipo) {
        var lista = tipo != null
                ? trocaRepository.findByTipoOrderByDataTrocaDesc(tipo)
                : trocaRepository.findAllByOrderByDataTrocaDesc();
        return lista.stream().map(this::toDto).toList();
    }

    @PostMapping
    public TrocaDto salvar(@RequestBody TrocaRequest req) {
        Troca troca = new Troca();
        troca.setCarro(carroRepository.findAll().get(0));
        troca.setPeca(pecaRepository.findById(req.pecaId()).orElseThrow());
        troca.setTipo(req.tipo() != null ? req.tipo() : "SERVICO");
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

    @PutMapping("/{id}")
    public TrocaDto update(@PathVariable Long id, @RequestBody TrocaRequest req) {
        Troca troca = trocaRepository.findById(id).orElseThrow();
        if (req.pecaId() != null) troca.setPeca(pecaRepository.findById(req.pecaId()).orElseThrow());
        if (req.dataTroca() != null) troca.setDataTroca(req.dataTroca());
        if (req.km() != null) troca.setKm(req.km());
        if (req.valor() != null) troca.setValor(req.valor());
        if (req.maoDeObra() != null) troca.setMaoDeObra(req.maoDeObra());
        troca.setFornecedor(req.fornecedor());
        troca.setGarantiaMeses(req.garantiaMeses());
        troca.setObservacoes(req.observacoes());
        return toDto(trocaRepository.save(troca));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        trocaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

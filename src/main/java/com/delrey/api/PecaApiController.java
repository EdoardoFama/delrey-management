package com.delrey.api;

import com.delrey.peca.CategoriaPecaRepository;
import com.delrey.peca.Peca;
import com.delrey.peca.PecaRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/pecas")
public class PecaApiController {

    private final PecaRepository pecaRepository;
    private final TrocaRepository trocaRepository;
    private final CategoriaPecaRepository categoriaRepository;

    public PecaApiController(PecaRepository pecaRepository, TrocaRepository trocaRepository,
                              CategoriaPecaRepository categoriaRepository) {
        this.pecaRepository = pecaRepository;
        this.trocaRepository = trocaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    record CategoriaDto(Long id, String nome) {}
    record PecaDto(Long id, String nome, CategoriaDto categoria, String codigoOem, String fabricante,
                   Integer intervaloKm, Integer intervaloMeses, String observacoes) {}
    record TrocaHistorico(Long id, LocalDate dataTroca, Integer km, BigDecimal valor, BigDecimal maoDeObra,
                          String fornecedor, Integer garantiaMeses, String observacoes) {}
    record PecaDetalhe(PecaDto peca, List<TrocaHistorico> historico) {}

    private PecaDto toDto(Peca p) {
        return new PecaDto(p.getId(), p.getNome(),
                new CategoriaDto(p.getCategoria().getId(), p.getCategoria().getNome()),
                p.getCodigoOem(), p.getFabricante(), p.getIntervaloKm(), p.getIntervaloMeses(), p.getObservacoes());
    }

    @GetMapping("/categorias")
    public List<CategoriaDto> listarCategorias() {
        return categoriaRepository.findAll().stream()
                .sorted(Comparator.comparing(c -> c.getNome()))
                .map(c -> new CategoriaDto(c.getId(), c.getNome()))
                .toList();
    }

    @GetMapping
    public List<PecaDto> listar(@RequestParam(required = false) String q) {
        var pecas = (q == null || q.isBlank())
                ? pecaRepository.findAllByOrderByNome()
                : pecaRepository.findByNomeContainingIgnoreCaseOrderByNome(q);
        return pecas.stream().map(this::toDto).toList();
    }

    record PecaCreateRequest(String nome, Long categoriaId) {}
    record PecaUpdateRequest(String nome, String codigoOem, String fabricante,
                              Integer intervaloKm, Integer intervaloMeses, String observacoes) {}

    @PostMapping
    public PecaDto criar(@RequestBody PecaCreateRequest req) {
        Peca peca = new Peca();
        peca.setNome(req.nome().trim());
        peca.setCategoria(categoriaRepository.findById(req.categoriaId()).orElseThrow());
        return toDto(pecaRepository.save(peca));
    }

    @PutMapping("/{id}")
    public PecaDto update(@PathVariable Long id, @RequestBody PecaUpdateRequest req) {
        Peca peca = pecaRepository.findById(id).orElseThrow();
        if (req.nome() != null) peca.setNome(req.nome());
        if (req.codigoOem() != null) peca.setCodigoOem(req.codigoOem());
        if (req.fabricante() != null) peca.setFabricante(req.fabricante());
        if (req.intervaloKm() != null) peca.setIntervaloKm(req.intervaloKm());
        if (req.intervaloMeses() != null) peca.setIntervaloMeses(req.intervaloMeses());
        if (req.observacoes() != null) peca.setObservacoes(req.observacoes());
        return toDto(pecaRepository.save(peca));
    }

    @GetMapping("/{id}")
    public PecaDetalhe detalhe(@PathVariable Long id) {
        Peca peca = pecaRepository.findById(id).orElseThrow();
        List<TrocaHistorico> historico = trocaRepository.historicoPorPeca(id).stream()
                .map(t -> new TrocaHistorico(t.getId(), t.getDataTroca(), t.getKm(),
                        t.getValor(), t.getMaoDeObra(), t.getFornecedor(), t.getGarantiaMeses(), t.getObservacoes()))
                .toList();
        return new PecaDetalhe(toDto(peca), historico);
    }
}

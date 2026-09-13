package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.config.UserContextService;
import com.delrey.peca.Peca;
import com.delrey.peca.PecaRepository;
import com.delrey.problema.Problema;
import com.delrey.problema.ProblemaRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/problemas")
public class ProblemaApiController {

    private final ProblemaRepository problemaRepository;
    private final CarroRepository carroRepository;
    private final PecaRepository pecaRepository;
    private final TrocaRepository trocaRepository;
    private final UserContextService userContextService;

    public ProblemaApiController(ProblemaRepository problemaRepository, CarroRepository carroRepository,
                                  PecaRepository pecaRepository, TrocaRepository trocaRepository,
                                  UserContextService userContextService) {
        this.problemaRepository = problemaRepository;
        this.carroRepository = carroRepository;
        this.pecaRepository = pecaRepository;
        this.trocaRepository = trocaRepository;
        this.userContextService = userContextService;
    }

    record PecaSuspeitaDto(Long id, String nome, String categoriaNome) {}

    record ProblemaDto(
        Long id, String titulo, String sintoma,
        LocalDate dataInicio, LocalDate dataResolucao,
        String status,
        Long trocaIdResolveu, String trocaDescricao,
        List<PecaSuspeitaDto> pecasSuspeitas,
        String observacoes
    ) {}

    record ProblemaInput(
        String titulo, String sintoma,
        LocalDate dataInicio, LocalDate dataResolucao,
        Long trocaIdResolveu,
        List<Long> pecaSuspeitaIds,
        String observacoes
    ) {}

    private ProblemaDto toDto(Problema p) {
        String status = p.getDataResolucao() != null ? "RESOLVIDO" : "ABERTO";
        String trocaDesc = null;
        if (p.getTrocaResolveu() != null) {
            trocaDesc = p.getTrocaResolveu().getPeca().getNome()
                + " — " + p.getTrocaResolveu().getDataTroca();
        }
        List<PecaSuspeitaDto> suspeitas = p.getPecasSuspeitas().stream()
            .map(peca -> new PecaSuspeitaDto(peca.getId(), peca.getNome(), peca.getCategoria().getNome()))
            .toList();
        return new ProblemaDto(
            p.getId(), p.getTitulo(), p.getSintoma(),
            p.getDataInicio(), p.getDataResolucao(),
            status,
            p.getTrocaResolveu() != null ? p.getTrocaResolveu().getId() : null,
            trocaDesc,
            suspeitas,
            p.getObservacoes()
        );
    }

    @GetMapping
    public List<ProblemaDto> listar(@RequestParam(required = false) String status) {
        Carro carro = userContextService.getCarroDoUsuarioAtual();
        return problemaRepository.findByCarroIdOrderByDataInicioDesc(carro.getId()).stream()
            .filter(p -> {
                if ("ABERTO".equals(status)) return p.getDataResolucao() == null;
                if ("RESOLVIDO".equals(status)) return p.getDataResolucao() != null;
                return true;
            })
            .map(this::toDto)
            .toList();
    }

    @PostMapping
    public ProblemaDto criar(@RequestBody ProblemaInput req) {
        Carro carro = userContextService.getCarroDoUsuarioAtual();
        Problema p = new Problema();
        p.setCarro(carro);
        p.setTitulo(req.titulo());
        p.setSintoma(req.sintoma());
        p.setDataInicio(req.dataInicio() != null ? req.dataInicio() : LocalDate.now());
        p.setDataResolucao(req.dataResolucao());
        p.setObservacoes(req.observacoes());
        if (req.trocaIdResolveu() != null) {
            trocaRepository.findById(req.trocaIdResolveu()).ifPresent(p::setTrocaResolveu);
        }
        if (req.pecaSuspeitaIds() != null) {
            List<Peca> suspeitas = req.pecaSuspeitaIds().stream()
                .map(id -> pecaRepository.findById(id).orElse(null))
                .filter(peca -> peca != null)
                .toList();
            p.setPecasSuspeitas(suspeitas);
        }
        return toDto(problemaRepository.save(p));
    }

    @PutMapping("/{id}")
    public ProblemaDto atualizar(@PathVariable Long id, @RequestBody ProblemaInput req) {
        Problema p = problemaRepository.findById(id).orElseThrow();
        Carro carroUsuario = userContextService.getCarroDoUsuarioAtual();
        if (!p.getCarro().getId().equals(carroUsuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao recurso");
        }
        if (req.titulo() != null) p.setTitulo(req.titulo());
        if (req.sintoma() != null) p.setSintoma(req.sintoma());
        if (req.dataInicio() != null) p.setDataInicio(req.dataInicio());
        p.setDataResolucao(req.dataResolucao());
        p.setObservacoes(req.observacoes());
        if (req.trocaIdResolveu() != null) {
            trocaRepository.findById(req.trocaIdResolveu()).ifPresent(p::setTrocaResolveu);
        } else {
            p.setTrocaResolveu(null);
        }
        if (req.pecaSuspeitaIds() != null) {
            List<Peca> suspeitas = req.pecaSuspeitaIds().stream()
                .map(pId -> pecaRepository.findById(pId).orElse(null))
                .filter(peca -> peca != null)
                .toList();
            p.setPecasSuspeitas(suspeitas);
        }
        return toDto(problemaRepository.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Problema p = problemaRepository.findById(id).orElseThrow();
        Carro carroUsuario = userContextService.getCarroDoUsuarioAtual();
        if (!p.getCarro().getId().equals(carroUsuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao recurso");
        }
        problemaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

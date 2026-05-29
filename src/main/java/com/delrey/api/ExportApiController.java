package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import com.delrey.combustivel.Abastecimento;
import com.delrey.combustivel.AbastecimentoRepository;
import com.delrey.hodometro.LeituraKm;
import com.delrey.hodometro.LeituraKmRepository;
import com.delrey.problema.Problema;
import com.delrey.problema.ProblemaRepository;
import com.delrey.troca.Troca;
import com.delrey.troca.TrocaRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/export")
public class ExportApiController {

    private final TrocaRepository trocaRepository;
    private final AbastecimentoRepository abastecimentoRepository;
    private final LeituraKmRepository leituraKmRepository;
    private final ProblemaRepository problemaRepository;
    private final CarroRepository carroRepository;

    public ExportApiController(TrocaRepository trocaRepository,
                                AbastecimentoRepository abastecimentoRepository,
                                LeituraKmRepository leituraKmRepository,
                                ProblemaRepository problemaRepository,
                                CarroRepository carroRepository) {
        this.trocaRepository = trocaRepository;
        this.abastecimentoRepository = abastecimentoRepository;
        this.leituraKmRepository = leituraKmRepository;
        this.problemaRepository = problemaRepository;
        this.carroRepository = carroRepository;
    }

    // ---- CSV ----

    @GetMapping("/csv")
    public void downloadCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"delrey_historico.csv\"");

        try (PrintWriter pw = response.getWriter()) {
            pw.println("tipo,data,peca,categoria,km,valor,mao_de_obra,total,fornecedor,garantia_meses,observacoes");
            for (Troca t : trocaRepository.findAllByOrderByDataTrocaDesc()) {
                BigDecimal mdo = t.getMaoDeObra() != null ? t.getMaoDeObra() : BigDecimal.ZERO;
                BigDecimal total = t.getValor().add(mdo);
                pw.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    t.getTipo(),
                    t.getDataTroca(),
                    csv(t.getPeca().getNome()),
                    csv(t.getPeca().getCategoria().getNome()),
                    t.getKm() != null ? t.getKm() : "",
                    t.getValor(),
                    t.getMaoDeObra() != null ? t.getMaoDeObra() : "",
                    total,
                    csv(t.getFornecedor()),
                    t.getGarantiaMeses() != null ? t.getGarantiaMeses() : "",
                    csv(t.getObservacoes())
                );
            }
        }
    }

    // ---- JSON ----

    @GetMapping("/json")
    public Map<String, Object> downloadJson(HttpServletResponse response) {
        response.setHeader("Content-Disposition", "attachment; filename=\"delrey_backup.json\"");

        Carro carro = carroRepository.findAll().stream().findFirst().orElse(null);

        List<Map<String, Object>> trocas = trocaRepository.findAllByOrderByDataTrocaDesc().stream()
            .map(t -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", t.getId());
                m.put("tipo", t.getTipo());
                m.put("data", t.getDataTroca());
                m.put("peca", t.getPeca().getNome());
                m.put("categoria", t.getPeca().getCategoria().getNome());
                m.put("km", t.getKm());
                m.put("valor", t.getValor());
                m.put("maoDeObra", t.getMaoDeObra());
                m.put("fornecedor", t.getFornecedor());
                m.put("garantiaMeses", t.getGarantiaMeses());
                m.put("observacoes", t.getObservacoes());
                return m;
            }).toList();

        List<Map<String, Object>> abastecimentos = abastecimentoRepository.findAllByOrderByDataDesc().stream()
            .map(a -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", a.getId());
                m.put("data", a.getData());
                m.put("km", a.getKm());
                m.put("litros", a.getLitros());
                m.put("valorLitro", a.getValorLitro());
                m.put("valorTotal", a.getValorTotal());
                m.put("tipoCombustivel", a.getTipoCombustivel());
                m.put("posto", a.getPosto());
                m.put("tanqueCheio", a.getTanqueCheio());
                m.put("observacoes", a.getObservacoes());
                return m;
            }).toList();

        List<Map<String, Object>> leituras = leituraKmRepository.findAllByOrderByDataDesc().stream()
            .map(l -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", l.getId());
                m.put("data", l.getData());
                m.put("km", l.getKm());
                m.put("observacoes", l.getObservacoes());
                return m;
            }).toList();

        List<Map<String, Object>> problemas = problemaRepository.findAllByOrderByDataInicioDesc().stream()
            .map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", p.getId());
                m.put("titulo", p.getTitulo());
                m.put("sintoma", p.getSintoma());
                m.put("dataInicio", p.getDataInicio());
                m.put("dataResolucao", p.getDataResolucao());
                m.put("status", p.getDataResolucao() != null ? "RESOLVIDO" : "ABERTO");
                m.put("pecasSuspeitas", p.getPecasSuspeitas().stream()
                    .map(pc -> pc.getNome()).toList());
                m.put("observacoes", p.getObservacoes());
                return m;
            }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("exportadoEm", LocalDateTime.now().toString());
        if (carro != null) {
            Map<String, Object> carroMap = new LinkedHashMap<>();
            carroMap.put("modelo", carro.getModelo());
            carroMap.put("ano", carro.getAno());
            carroMap.put("motor", carro.getMotor());
            carroMap.put("versao", carro.getVersao());
            carroMap.put("placa", carro.getPlaca());
            carroMap.put("cor", carro.getCor());
            carroMap.put("kmAtual", carro.getKmAtual());
            carroMap.put("observacoes", carro.getObservacoes());
            result.put("carro", carroMap);
        }
        result.put("trocas", trocas);
        result.put("abastecimentos", abastecimentos);
        result.put("leiturasKm", leituras);
        result.put("problemas", problemas);
        return result;
    }

    private static String csv(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }
}

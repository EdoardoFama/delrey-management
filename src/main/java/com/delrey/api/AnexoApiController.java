package com.delrey.api;

import com.delrey.anexo.Anexo;
import com.delrey.anexo.AnexoRepository;
import com.delrey.troca.TrocaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/anexos")
public class AnexoApiController {

    private final AnexoRepository anexoRepository;
    private final TrocaRepository trocaRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public AnexoApiController(AnexoRepository anexoRepository, TrocaRepository trocaRepository) {
        this.anexoRepository = anexoRepository;
        this.trocaRepository = trocaRepository;
    }

    record AnexoDto(Long id, Long trocaId, String tipo, String nomeArquivo, String descricao, LocalDateTime criadoEm) {}

    private AnexoDto toDto(Anexo a) {
        return new AnexoDto(a.getId(), a.getTroca().getId(), a.getTipo(),
                a.getNomeArquivo(), a.getDescricao(), a.getCriadoEm());
    }

    @GetMapping
    public List<AnexoDto> listar(@RequestParam Long trocaId) {
        return anexoRepository.findByTrocaIdOrderByCriadoEmDesc(trocaId).stream()
                .map(this::toDto).toList();
    }

    @PostMapping
    public AnexoDto upload(@RequestParam("file") MultipartFile file,
                            @RequestParam Long trocaId,
                            @RequestParam(required = false) String descricao) throws IOException {
        Path dir = Paths.get(uploadDir, "anexos");
        Files.createDirectories(dir);

        String orig = file.getOriginalFilename() != null ? file.getOriginalFilename() : "arquivo";
        String ext = "";
        if (orig.contains(".")) ext = orig.substring(orig.lastIndexOf('.'));

        String filename = "anexo-" + UUID.randomUUID() + ext;
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest);

        Anexo anexo = new Anexo();
        anexo.setTroca(trocaRepository.findById(trocaId).orElseThrow());
        anexo.setNomeArquivo(orig);
        anexo.setCaminho("anexos/" + filename);
        anexo.setDescricao(descricao);
        anexoRepository.save(anexo);

        return toDto(anexo);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Anexo anexo = anexoRepository.findById(id).orElseThrow();
        Path path = Paths.get(uploadDir, anexo.getCaminho());
        Resource resource = new FileSystemResource(path);

        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String nome = anexo.getNomeArquivo().toLowerCase();
        if (nome.endsWith(".pdf")) contentType = "application/pdf";
        else if (nome.endsWith(".jpg") || nome.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (nome.endsWith(".png")) contentType = "image/png";
        else if (nome.endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + anexo.getNomeArquivo() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) throws IOException {
        Anexo anexo = anexoRepository.findById(id).orElseThrow();
        try { Files.deleteIfExists(Paths.get(uploadDir, anexo.getCaminho())); } catch (Exception ignored) {}
        anexoRepository.delete(anexo);
        return ResponseEntity.noContent().build();
    }
}

package com.delrey.api;

import com.delrey.carro.Carro;
import com.delrey.carro.CarroRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/carro")
public class CarroApiController {

    private final CarroRepository carroRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public CarroApiController(CarroRepository carroRepository) {
        this.carroRepository = carroRepository;
    }

    record CarroDto(Long id, String modelo, Integer ano, String motor, String versao,
                    String placa, Integer kmAtual, String cor, String fotoUrl, String observacoes) {}

    record CarroUpdateRequest(String modelo, Integer ano, String motor, String versao,
                               String placa, Integer kmAtual, String cor, String observacoes) {}

    private CarroDto toDto(Carro c) {
        String fotoUrl = c.getFotoPath() != null ? "/api/carro/foto" : null;
        return new CarroDto(c.getId(), c.getModelo(), c.getAno(), c.getMotor(), c.getVersao(),
                c.getPlaca(), c.getKmAtual(), c.getCor(), fotoUrl, c.getObservacoes());
    }

    @GetMapping
    public CarroDto get() {
        return carroRepository.findAll().stream().findFirst().map(this::toDto).orElseThrow();
    }

    @PutMapping
    public CarroDto update(@RequestBody CarroUpdateRequest req) {
        Carro carro = carroRepository.findAll().get(0);
        if (req.modelo() != null) carro.setModelo(req.modelo());
        if (req.ano() != null) carro.setAno(req.ano());
        if (req.motor() != null) carro.setMotor(req.motor());
        if (req.versao() != null) carro.setVersao(req.versao());
        if (req.placa() != null) carro.setPlaca(req.placa());
        if (req.kmAtual() != null) carro.setKmAtual(req.kmAtual());
        if (req.cor() != null) carro.setCor(req.cor());
        if (req.observacoes() != null) carro.setObservacoes(req.observacoes());
        return toDto(carroRepository.save(carro));
    }

    @PostMapping("/foto")
    public CarroDto uploadFoto(@RequestParam("file") MultipartFile file) throws IOException {
        Carro carro = carroRepository.findAll().get(0);

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String ext = "";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains(".")) ext = orig.substring(orig.lastIndexOf('.'));

        String filename = "carro-" + UUID.randomUUID() + ext;
        Path dest = dir.resolve(filename);

        if (carro.getFotoPath() != null) {
            try { Files.deleteIfExists(Paths.get(uploadDir, carro.getFotoPath())); } catch (Exception ignored) {}
        }

        Files.copy(file.getInputStream(), dest);
        carro.setFotoPath(filename);
        return toDto(carroRepository.save(carro));
    }

    @GetMapping("/foto")
    public ResponseEntity<byte[]> getFoto() throws IOException {
        Carro carro = carroRepository.findAll().get(0);
        if (carro.getFotoPath() == null) return ResponseEntity.notFound().build();

        Path path = Paths.get(uploadDir, carro.getFotoPath());
        if (!Files.exists(path)) return ResponseEntity.notFound().build();

        byte[] bytes = Files.readAllBytes(path);
        String type = Files.probeContentType(path);
        MediaType mediaType = type != null ? MediaType.parseMediaType(type) : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok().contentType(mediaType).body(bytes);
    }
}

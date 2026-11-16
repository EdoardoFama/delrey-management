package com.delrey.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthApiController {

    private static final Logger log = LoggerFactory.getLogger(HealthApiController.class);

    private final JdbcTemplate jdbcTemplate;

    public HealthApiController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "delrey-management");
        response.put("timestamp", System.currentTimeMillis());

        try {
            Integer dbResult = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("database", dbResult != null && dbResult == 1 ? "UP" : "UNKNOWN");
        } catch (Exception e) {
            log.warn("Health check falhou ao consultar o banco de dados: {}", e.getMessage());
            response.put("database", "DOWN");
            response.put("dbError", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "name", "Del Rey Management API",
                "message", "Backend operacional. Acesse a interface na Vercel.",
                "docs", "/api/health"
        ));
    }
}

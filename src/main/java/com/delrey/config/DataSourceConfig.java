package com.delrey.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
@Profile("prod")
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    // Regex para extrair partes da URL sem usar java.net.URI (que quebra com * na senha)
    // Formato: postgresql://user:pass@host:port/db?query
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(?:postgres|postgresql)://([^:@]*)(?::([^@]*))?@([^:/]+)(?::(\\d+))?(/[^?]*)?(?:\\?(.*))?$"
    );

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String dbUrl = env.getProperty("SPRING_DATASOURCE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = env.getProperty("DATABASE_URL");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = env.getProperty("POSTGRES_URL");
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            log.info("Detectada URL de banco em nuvem. Convertendo para JDBC via regex...");
            Matcher matcher = URL_PATTERN.matcher(dbUrl);
            if (matcher.matches()) {
                try {
                    String username = URLDecoder.decode(matcher.group(1) != null ? matcher.group(1) : "", StandardCharsets.UTF_8);
                    String password = URLDecoder.decode(matcher.group(2) != null ? matcher.group(2) : "", StandardCharsets.UTF_8);
                    String host = matcher.group(3);
                    String port = matcher.group(4) != null ? matcher.group(4) : "5432";
                    String path = matcher.group(5) != null ? matcher.group(5) : "/postgres";
                    String query = matcher.group(6);

                    StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                            .append(host)
                            .append(":").append(port)
                            .append(path);
                    if (query != null && !query.isBlank()) {
                        jdbcUrl.append("?").append(query);
                    }

                    config.setJdbcUrl(jdbcUrl.toString());
                    if (!username.isBlank()) config.setUsername(username);
                    if (!password.isBlank()) config.setPassword(password);

                    log.info("JDBC URL configurada com sucesso para o host: {}", host);
                } catch (Exception e) {
                    log.error("Falha ao processar DATABASE_URL via regex: {}", e.getMessage());
                    throw new RuntimeException("Falha ao configurar DataSource: " + e.getMessage(), e);
                }
            } else {
                log.error("DATABASE_URL não corresponde ao padrão esperado: {}", dbUrl.replaceAll(":([^@]*)@", ":***@"));
                throw new RuntimeException("DATABASE_URL inválida. Formato esperado: postgresql://user:pass@host:port/db");
            }
        } else if (dbUrl != null && dbUrl.startsWith("jdbc:")) {
            config.setJdbcUrl(dbUrl);
            config.setUsername(env.getProperty("SPRING_DATASOURCE_USERNAME", env.getProperty("PGUSER", "postgres")));
            config.setPassword(env.getProperty("SPRING_DATASOURCE_PASSWORD", env.getProperty("PGPASSWORD", "")));
        } else {
            String host = env.getProperty("PGHOST", "localhost");
            String port = env.getProperty("PGPORT", "5432");
            String db = env.getProperty("PGDATABASE", "delrey");
            config.setJdbcUrl(String.format("jdbc:postgresql://%s:%s/%s", host, port, db));
            config.setUsername(env.getProperty("PGUSER", "postgres"));
            config.setPassword(env.getProperty("PGPASSWORD", ""));
        }

        // Pool otimizado para plano free (512MB RAM)
        config.setMaximumPoolSize(Integer.parseInt(env.getProperty("DB_POOL_MAX_SIZE", "5")));
        config.setMinimumIdle(Integer.parseInt(env.getProperty("DB_POOL_MIN_IDLE", "1")));
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}

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
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
@Profile("prod")
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

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
            log.info("Detectada URL de banco em nuvem (DATABASE_URL/POSTGRES_URL). Convertendo para JDBC...");
            try {
                String cleanUrl = dbUrl.replaceFirst("^postgres://", "postgresql://");
                URI uri = new URI(cleanUrl);

                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    username = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
                    if (parts.length > 1) {
                        password = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
                    }
                }

                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(uri.getHost())
                        .append(":")
                        .append(port)
                        .append(path);

                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                }

                config.setJdbcUrl(jdbcUrl.toString());
                if (username != null) config.setUsername(username);
                if (password != null) config.setPassword(password);

                log.info("JDBC URL configurada com sucesso para o host: {}", uri.getHost());
            } catch (Exception e) {
                log.warn("Não foi possível parsear DATABASE_URL como URI, aplicando fallback: {}", e.getMessage());
                config.setJdbcUrl(dbUrl);
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

        // Configuração de pool otimizada para o plano free (512MB RAM)
        config.setMaximumPoolSize(Integer.parseInt(env.getProperty("DB_POOL_MAX_SIZE", "5")));
        config.setMinimumIdle(Integer.parseInt(env.getProperty("DB_POOL_MIN_IDLE", "1")));
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}

# Del Rey Management

Sistema pessoal de manutenção do **Ford Del Rey 1990 AP 1.8 Ghia**.

## Stack
- Java 21 + Spring Boot 3
- Spring Data JPA + Flyway
- H2 (dev, arquivo local) / PostgreSQL (prod)
- Thymeleaf + Tailwind (CDN) + HTMX
- Maven

## Rodando
```powershell
mvn spring-boot:run
```
Acesse: http://localhost:8080
Console do banco H2: http://localhost:8080/h2 (jdbc url: `jdbc:h2:file:./data/delrey`, user `sa`, sem senha)

## Estrutura do MVP

- **Carro**: cadastro do veículo (já vem com seu Del Rey 1990 AP 1.8 Ghia)
- **Peças**: catálogo pré-populado com peças típicas do AP 1.8 (correia dentada, vela, bomba dágua, embreagem, amortecedor, freios, etc.)
- **Trocas**: registra data, KM, valor, mão de obra, fornecedor, garantia
- **Dashboard**: gasto do mês, gasto do ano, últimas trocas, gasto por categoria

## Próximos passos
- Upload de fotos/notas fiscais
- Lembretes baseados em km/data
- Cadastro de problemas + busca por sintoma
- Deploy (Railway/Render) + Postgres

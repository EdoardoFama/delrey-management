# Del Rey Management

Sistema pessoal de gestão e manutenção do **Ford Del Rey 1990 AP 1.8 Ghia**.  
Controle completo de gastos, peças, serviços, combustível, hodômetro e muito mais — com interface moderna e dark mode.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Java 21 + Spring Boot 3.3 |
| Persistência | Spring Data JPA + Flyway |
| Banco (dev) | H2 em modo arquivo (compatibilidade PostgreSQL) |
| Banco (prod) | PostgreSQL via Railway |
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS (dark mode, tema roxo) |
| Segurança | Spring Security — autenticação por usuário/senha via variáveis de ambiente |
| Deploy | Docker multi-stage → Railway |

---

## Rodando localmente

```powershell
# Backend + frontend (Maven faz o build do Vite automaticamente)
mvn spring-boot:run
```

Acesse: [http://localhost:8080](http://localhost:8080)

Console H2: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
JDBC URL: `jdbc:h2:file:./data/delrey` · Usuário: `sa` · Senha: _(vazio)_

### Variáveis de ambiente necessárias em produção

```
APP_ADMIN_USER=admin
APP_ADMIN_PASS=senha_bcrypt
APP_KAIO_USER=kaio
APP_KAIO_PASS=senha_bcrypt
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/db
SPRING_DATASOURCE_USERNAME=usuario
SPRING_DATASOURCE_PASSWORD=senha
```

---

## Funcionalidades

### Dashboard
Painel principal com visão geral do período selecionado (ano/mês).

- **Cards de resumo**: total gasto, total em compras, total em serviços e custo por km rodado
- **Gráficos de rosca (donut)**: distribuição de gastos por categoria, separados entre compras e serviços
- **Ranking de fornecedores**: os 5 fornecedores com maior gasto no período
- **Últimas intervenções**: os registros mais recentes filtrados pelo período selecionado
- **Atalhos rápidos**: links para Alertas, Garantias e Timeline

---

### Compras de Peças
Registro de todas as peças adquiridas.

- Cadastro com: peça (buscável/criável inline), data, KM, valor, fornecedor, observações
- **Filtros**: ano, mês, categoria da peça, ordenação (data, nome, valor)
- **Edição e exclusão** de cada registro
- **Anexos**: upload de notas fiscais, fotos e documentos (PDF, JPG, PNG) por registro
- Ao salvar, atualiza automaticamente o KM atual do carro se for maior

---

### Serviços
Registro de serviços realizados no carro (mão de obra de mecânicos, borracharia, etc.).

- Mesmos campos de Compras + campo de **mão de obra** separado
- Campo de **garantia** (em meses) para rastrear serviços ainda na garantia
- Filtros, edição, exclusão e anexos — igual às Compras

---

### Peças (catálogo)
Catálogo completo de peças do Del Rey AP 1.8.

- Pré-populado com ~60 peças divididas em categorias (Motor, Freios, Suspensão, Elétrica, etc.)
- **Cadastro inline** durante o registro de compras/serviços: se a peça não existe, ela é criada na hora
- Cada peça pode ter configurados: intervalo de troca em **KM** e/ou **meses** (alimenta os alertas)
- **Página de detalhe** (`/pecas/:id`): histórico completo de trocas daquela peça

---

### Combustível
Controle de todos os abastecimentos.

- Registro com: data, KM, litros, R$/litro, tipo de combustível (Gasolina, Etanol, Flex), posto, tanque cheio
- **Cálculo automático** do valor total (litros × R$/litro)
- **Consumo km/L** calculado automaticamente entre abastecimentos consecutivos com tanque cheio
- Cards de resumo: consumo médio, gasto total, R$/litro médio, total de litros
- Edição e exclusão de cada abastecimento

---

### Hodômetro
Registro das leituras de quilometragem ao longo do tempo.

- Registra leituras periódicas de KM com data e observação
- Calcula automaticamente **ritmo de uso** (km/mês médio)
- Exibe a **diferença** entre leituras consecutivas
- Atualiza o `km_atual` do carro a cada nova leitura
- Usado como base para a Projeção de Gastos

---

### Alertas de Manutenção
Lista inteligente de peças que precisam de atenção.

- Considera os intervalos configurados em cada peça (km e/ou meses desde a última troca)
- **Status por peça**:
  - 🔴 **Atrasado** — prazo/KM já ultrapassado
  - 🟡 **Próximo** — faltam ≤ 30 dias ou ≤ 1.000 km
  - 🟢 **OK** — dentro do prazo
  - ⚪ **Sem registro** — nunca foi trocada
- Filtro por status com contagem de cada grupo
- Link direto para a página de detalhe da peça

---

### Garantias
Painel de garantias ativas.

- Lista todos os serviços que ainda estão dentro da garantia configurada
- Exibe: dias restantes, data de vencimento, valor do serviço e fornecedor
- Ordenado do mais próximo de vencer para o mais distante

---

### Projeção de Gastos
Estimativa de gastos futuros para 3, 6 e 12 meses.

- **Combustível projetado**: baseado no ritmo de uso (km/mês) e consumo médio (km/L)
- **Manutenções previstas**: peças com alerta configurado que vencem no período
- **Baseline histórica**: média mensal dos últimos 12 meses como referência alternativa
- Cards de premissas: ritmo de uso, consumo médio, R$/litro médio, média mensal histórica
- Avisos automáticos quando faltam dados (hodômetro ou abastecimentos insuficientes)
- Lista detalhada das peças previstas com custo estimado e link para o detalhe

---

### Problemas & Sintomas
Diário de problemas e falhas do carro.

- Registra: título, descrição do sintoma, data de início, data de resolução
- Vincula **peças suspeitas** (multi-select com busca no catálogo)
- Vincula a **troca que resolveu** o problema (referência ao registro de serviço)
- Status automático: **Aberto** ou **Resolvido**
- Filtro por status, expandir para ver detalhes, botão "Marcar resolvido"

---

### Timeline
Linha do tempo de todas as intervenções.

- Todos os registros (compras e serviços) agrupados por **mês/ano**
- Total gasto por mês
- Visão cronológica completa da história do carro

---

### Dossiê do Carro (`/relatorio`)
Relatório completo do carro para impressão ou compartilhamento.

- Dados do veículo (modelo, ano, motor, placa, cor, KM atual)
- **Resumo financeiro**: total geral, por compras, por serviços e por combustível
- **Top categorias** com maior gasto acumulado
- **Estatísticas de uso**: ritmo, consumo médio, total de litros
- **Manutenções atrasadas e próximas** em destaque
- **Histórico completo** de todas as intervenções em tabela com totais
- Botão **Imprimir** (abre diálogo de impressão, navbar e botões somem automaticamente)
- Botões de **export CSV** e **export JSON** diretamente na página

---

### Export de Dados
Backup completo do histórico.

- **CSV** (`/api/export/csv`): todas as trocas (compras + serviços) com colunas tipo, data, peça, categoria, km, valor, mão de obra, total, fornecedor, garantia e observações. Compatível com Excel.
- **JSON** (`/api/export/json`): backup completo com carro, trocas, abastecimentos, leituras de km e problemas registrados.

---

### Meu Carro
Ficha do veículo.

- Edita: modelo, ano, motor, versão, placa, cor, KM atual, observações
- Upload de **foto do carro** (exibida no perfil)

---

## Estrutura do projeto

```
delrey-management/
├── src/main/java/com/delrey/
│   ├── api/              # Controllers REST
│   ├── carro/            # Entidade + repositório do carro
│   ├── peca/             # Catálogo de peças e categorias
│   ├── troca/            # Compras e serviços
│   ├── anexo/            # Arquivos anexados
│   ├── hodometro/        # Leituras de KM
│   ├── combustivel/      # Abastecimentos
│   ├── problema/         # Problemas e sintomas
│   ├── config/           # Spring Security
│   └── web/              # SpaController (SPA routing)
├── src/main/resources/
│   └── db/migration/     # Flyway V1–V7
└── frontend/
    └── src/
        ├── pages/        # Dashboard, Compras, Serviços, Peças, etc.
        ├── components/   # Navbar, DonutChart, PecaCombobox, AnexosList
        ├── api/          # client.ts (fetch wrapper)
        └── types.ts      # Interfaces TypeScript
```

---

## Banco de dados (Flyway migrations)

| Versão | Conteúdo |
|--------|----------|
| V1 | Schema base: carro, categoria_peca, peca, troca, anexo, problema |
| V2 | Seed: Del Rey AP 1.8 + 12 categorias + ~60 peças típicas |
| V3 | Campos `cor` e `foto_path` na tabela carro |
| V4 | Campo `tipo` (COMPRA/SERVICO) na tabela troca |
| V5 | Peças e compras iniciais (Mercado Livre — valores em aberto) |
| V6 | Campo `km` nullable na tabela troca |
| V7 | Tabelas `leitura_km` e `abastecimento` |

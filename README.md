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
| Banco (prod) | PostgreSQL (Neon.tech, Koyeb Postgres ou Supabase) |
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS (dark mode, tema roxo) |
| Segurança | Spring Security — autenticação por sessão com suporte a CORS e Vercel Proxy |
| Deploy Backend | Docker multi-stage → Koyeb |
| Deploy Frontend | Vercel (SPA com rewrites transparentes) |

---

## Rodando localmente

### 1. Backend (Spring Boot)
```powershell
mvn spring-boot:run
```
Acesse a API: [http://localhost:8080](http://localhost:8080)  
Console H2: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
JDBC URL: `jdbc:h2:file:./data/delrey` · Usuário: `sa` · Senha: _(vazio)_

### 2. Frontend (Vite)
```powershell
cd frontend
npm install
npm run dev
```
Acesse a aplicação: [http://localhost:5173](http://localhost:5173) (as requisições para `/api` são redirecionadas automaticamente para o backend local).

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

---

## Guia de Deploy (Koyeb + Vercel)

A nova arquitetura separa o **Backend (Koyeb)** do **Frontend (Vercel)**, aproveitando os planos 100% gratuitos de cada plataforma.

### Passo 1: Criar o Banco PostgreSQL Gratuito
Você pode usar qualquer provedor PostgreSQL gratuito na nuvem:
- **[Neon.tech](https://neon.tech)** (Recomendado — Serverless Postgres gratuito, rápido e sem expiração)
- **[Supabase](https://supabase.com)** (Projeto gratuito com PostgreSQL)
- **Koyeb Postgres** (disponível direto no painel do Koyeb)

Copie a connection string gerada (exemplo: `postgres://usuario:senha@ep-xyz.region.neon.tech/delrey?sslmode=require`).

---

### Passo 2: Deploy do Backend no Koyeb

1. Crie uma conta no [Koyeb](https://www.koyeb.com).
2. Clique em **Create App** e selecione **GitHub**.
3. Escolha o repositório `delrey_management`.
4. Em **Builder**, selecione **Dockerfile** (o repositório já possui um `Dockerfile` otimizado para o Koyeb).
5. Defina as **Environment Variables**:

| Variável | Exemplo de Valor | Descrição |
|----------|------------------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Ativa o perfil de produção com PostgreSQL |
| `DATABASE_URL` | `postgres://user:pass@host:5432/db?sslmode=require` | Connection string do seu PostgreSQL |
| `APP_ADMIN_USERNAME` | `delrey` | Usuário de login do administrador |
| `APP_ADMIN_PASSWORD` | `sua_senha_forte` | Senha de login do administrador |
| `APP_KAIO_USERNAME` | `kaiolucas` | Segundo usuário de acesso |
| `APP_KAIO_PASSWORD` | `outra_senha_forte` | Senha do segundo usuário |
| `APP_MONZA_USERNAME` | `monza` | Terceiro usuário de acesso |
| `APP_MONZA_PASSWORD` | `senha_do_monza` | Senha do terceiro usuário |
| `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` | Domínios autorizados |

6. Em **Health Checks**:
   - Tipo: **HTTP**
   - Caminho: `/api/health`
   - Porta: `8080`
7. Clique em **Deploy**.
8. Ao finalizar, copie a URL pública gerada pelo Koyeb (ex: `https://delrey-backend-seu-user.koyeb.app`). Teste acessando no navegador — você verá a mensagem `{"status":"UP", ...}`.

---

### Passo 3: Deploy do Frontend na Vercel

1. Abra o arquivo [frontend/vercel.json](file:///c:/Projetos_pessoais_DEV_ATUAL/delrey_management/frontend/vercel.json) e o arquivo da raiz [vercel.json](file:///c:/Projetos_pessoais_DEV_ATUAL/delrey_management/vercel.json).
2. Substitua `https://YOUR_KOYEB_BACKEND_URL` pela URL pública que você copiou do Koyeb no Passo 2:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://delrey-backend-seu-user.koyeb.app/api/:path*"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```
3. Faça commit e push dessas alterações no GitHub:
```bash
git add .
git commit -m "chore: configurar url do backend koyeb"
git push
```
4. Crie uma conta na [Vercel](https://vercel.com).
5. Clique em **Add New Project** e importe o repositório do GitHub.
6. Em **Framework Preset**, a Vercel detectará **Vite**.
7. Em **Root Directory**, selecione a pasta `frontend` (ou deixe na raiz, pois o repositório já inclui o `vercel.json` na raiz configurado para compilar a pasta `frontend`).
8. Clique em **Deploy**.

Pronto! Acesse o domínio da Vercel (ex: `https://delrey-management.vercel.app`). Todas as chamadas para `/api/*` e o login passarão pelo proxy transparente da Vercel, mantendo os cookies de sessão seguros sem problemas de CORS ou bloqueios de navegadores.


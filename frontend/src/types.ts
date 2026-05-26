export interface Carro {
  id: number
  modelo: string
  ano: number
  motor: string
  versao: string
  kmAtual: number
}

export interface Categoria {
  id: number
  nome: string
}

export interface Peca {
  id: number
  nome: string
  categoria: Categoria
  codigoOem?: string
  fabricante?: string
  intervaloKm?: number
  intervaloMeses?: number
  observacoes?: string
}

export interface Troca {
  id: number
  tipo: 'COMPRA' | 'SERVICO'
  pecaId: number
  pecaNome: string
  categoriaNome: string
  dataTroca: string
  km: number
  valor: number
  maoDeObra?: number
  fornecedor?: string
  garantiaMeses?: number
  observacoes?: string
}

export interface CategoriaTotal {
  categoria: string
  total: number
}

export interface DashboardData {
  carro: Carro
  ano: number
  mes: number | null
  totalPeriodo: number
  totalCompras: number
  totalServicos: number
  ultimasTrocas: Troca[]
  porCategoria: CategoriaTotal[]
  porCategoriaCompras: CategoriaTotal[]
  porCategoriaServicos: CategoriaTotal[]
  anosDisponiveis: number[]
  rankingFornecedores: FornecedorTotal[]
  custoPorKm: { custo: number; kmRodados: number | null }
}

export interface FornecedorTotal {
  fornecedor: string
  total: number
  quantidade: number
}

export interface Anexo {
  id: number
  trocaId: number
  tipo: string
  nomeArquivo: string
  descricao?: string
  criadoEm: string
}

export interface AlertaManutencao {
  pecaId: number
  pecaNome: string
  categoriaNome: string
  intervaloKm: number | null
  intervaloMeses: number | null
  ultimaTroca: string | null
  ultimoKm: number | null
  proximaPorData: string | null
  proximoPorKm: number | null
  diasParaProximo: number | null
  kmParaProximo: number | null
  status: 'ATRASADO' | 'PROXIMO' | 'OK' | 'SEM_REGISTRO'
}

export interface GarantiaAtiva {
  trocaId: number
  pecaNome: string
  categoriaNome: string
  dataTroca: string
  garantiaMeses: number
  validaAte: string
  diasRestantes: number
  valor: number
  maoDeObra?: number
  fornecedor?: string
}

export interface PecaDetalhe {
  peca: Peca
  historico: TrocaHistorico[]
}

export interface TrocaHistorico {
  id: number
  dataTroca: string
  km: number
  valor: number
  maoDeObra?: number
  fornecedor?: string
  garantiaMeses?: number
  observacoes?: string
}

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
  totalAno: number
  totalMes: number
  ano: number
  ultimasTrocas: Troca[]
  porCategoria: CategoriaTotal[]
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

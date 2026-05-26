const base = ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(base + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Não autenticado')
  }

  if (!res.ok) throw new Error(`Erro ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  getDashboard: (ano?: number, mes?: number | null) => {
    const params = new URLSearchParams()
    if (ano != null) params.set('ano', String(ano))
    if (mes != null) params.set('mes', String(mes))
    const qs = params.toString()
    return request(`/api/dashboard${qs ? `?${qs}` : ''}`)
  },
  getTrocas: (tipo?: string) => request(`/api/trocas${tipo ? `?tipo=${tipo}` : ''}`),
  createTroca: (body: unknown) => request('/api/trocas', { method: 'POST', body: JSON.stringify(body) }),
  deleteTroca: (id: number) => request(`/api/trocas/${id}`, { method: 'DELETE' }),
  getPecas: (q?: string) => request(`/api/pecas${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPeca: (id: number) => request(`/api/pecas/${id}`),
  getCategorias: () => request('/api/pecas/categorias'),
  createPeca: (body: { nome: string; categoriaId: number }) =>
    request('/api/pecas', { method: 'POST', body: JSON.stringify(body) }),
  getCarro: () => request('/api/carro'),
  updateCarro: (body: unknown) => request('/api/carro', { method: 'PUT', body: JSON.stringify(body) }),
  updatePeca: (id: number, body: unknown) => request(`/api/pecas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateTroca: (id: number, body: unknown) => request(`/api/trocas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getHodometro: () => request('/api/hodometro'),
  createLeituraKm: (body: unknown) => request('/api/hodometro', { method: 'POST', body: JSON.stringify(body) }),
  updateLeituraKm: (id: number, body: unknown) => request(`/api/hodometro/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLeituraKm: (id: number) => request(`/api/hodometro/${id}`, { method: 'DELETE' }),
  getCombustivel: () => request('/api/combustivel'),
  createAbastecimento: (body: unknown) => request('/api/combustivel', { method: 'POST', body: JSON.stringify(body) }),
  updateAbastecimento: (id: number, body: unknown) => request(`/api/combustivel/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAbastecimento: (id: number) => request(`/api/combustivel/${id}`, { method: 'DELETE' }),
  getAlertasManutencao: () => request('/api/alertas/manutencao'),
  getGarantia: () => request('/api/alertas/garantia'),
  getAnexos: (trocaId: number) => request(`/api/anexos?trocaId=${trocaId}`),
  deleteAnexo: (id: number) => request(`/api/anexos/${id}`, { method: 'DELETE' }),
  uploadAnexo: async (trocaId: number, file: File, descricao?: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('trocaId', String(trocaId))
    if (descricao) form.append('descricao', descricao)
    const res = await fetch('/api/anexos', { method: 'POST', credentials: 'include', body: form })
    if (res.status === 401) { window.location.href = '/login'; throw new Error('Não autenticado') }
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
  },
  uploadCarroFoto: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/carro/foto', { method: 'POST', credentials: 'include', body: form })
    if (res.status === 401) { window.location.href = '/login'; throw new Error('Não autenticado') }
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
  },
}

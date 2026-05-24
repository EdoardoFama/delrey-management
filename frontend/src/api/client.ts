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
  getDashboard: () => request('/api/dashboard'),
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
  uploadCarroFoto: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/carro/foto', { method: 'POST', credentials: 'include', body: form })
    if (res.status === 401) { window.location.href = '/login'; throw new Error('Não autenticado') }
    if (!res.ok) throw new Error(`Erro ${res.status}`)
    return res.json()
  },
}

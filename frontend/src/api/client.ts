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
  getTrocas: () => request('/api/trocas'),
  createTroca: (body: unknown) => request('/api/trocas', { method: 'POST', body: JSON.stringify(body) }),
  deleteTroca: (id: number) => request(`/api/trocas/${id}`, { method: 'DELETE' }),
  getPecas: (q?: string) => request(`/api/pecas${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPeca: (id: number) => request(`/api/pecas/${id}`),
}

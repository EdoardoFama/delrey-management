import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Abastecimento, CombustivelResumo } from '../types'

const inputCls = 'w-full bg-[#0a0a12] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
const labelCls = 'block text-xs text-gray-500 mb-1'
const selectCls = 'bg-[#16162a] border border-purple-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface Form {
  data: string
  km: string
  kmAndados: string
  litros: string
  valorTotal: string
  tipoCombustivel: string
  posto: string
  tanqueCheio: boolean
  observacoes: string
}

const emptyForm = (): Form => ({
  data: new Date().toISOString().split('T')[0],
  km: '',
  kmAndados: '',
  litros: '',
  valorTotal: '',
  tipoCombustivel: 'Gasolina',
  posto: '',
  tanqueCheio: true,
  observacoes: '',
})

export default function Combustivel() {
  const [resumo, setResumo] = useState<CombustivelResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Form>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Form | null>(null)

  // Filtros
  const [filtroMes, setFiltroMes] = useState<string>('')
  const [filtroAno, setFiltroAno] = useState<string>(String(new Date().getFullYear()))
  const [filtroPosto, setFiltroPosto] = useState<string>('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')

  function recarregar() {
    setLoading(true)
    api.getCombustivel(
      filtroAno ? Number(filtroAno) : undefined,
      filtroMes ? Number(filtroMes) : undefined,
      filtroPosto || undefined,
      filtroTipo || undefined
    ).then(r => {
      setResumo(r as CombustivelResumo)
      setLoading(false)
    })
  }

  useEffect(() => { recarregar() }, [filtroAno, filtroMes, filtroPosto, filtroTipo])

  const isPrimeiroAbastecimento = resumo?.abastecimentos.length === 0

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.valorTotal) return
    setSaving(true)
    await api.createAbastecimento({
      data: form.data || null,
      km: form.km ? Number(form.km) : null,
      kmAndados: form.kmAndados ? Number(form.kmAndados) : null,
      litros: form.litros ? Number(form.litros) : null,
      valorTotal: Number(form.valorTotal),
      tipoCombustivel: form.tipoCombustivel || null,
      posto: form.posto || null,
      tanqueCheio: form.tanqueCheio,
      observacoes: form.observacoes || null,
    })
    setForm(emptyForm())
    setShowForm(false)
    setSaving(false)
    recarregar()
  }

  async function handleSaveEdit(id: number) {
    if (!editForm || !editForm.valorTotal) return
    setSaving(true)
    await api.updateAbastecimento(id, {
      data: editForm.data || null,
      km: editForm.km ? Number(editForm.km) : null,
      kmAndados: editForm.kmAndados ? Number(editForm.kmAndados) : null,
      litros: editForm.litros ? Number(editForm.litros) : null,
      valorTotal: Number(editForm.valorTotal),
      tipoCombustivel: editForm.tipoCombustivel || null,
      posto: editForm.posto || null,
      tanqueCheio: editForm.tanqueCheio,
      observacoes: editForm.observacoes || null,
    })
    setEditingId(null)
    setEditForm(null)
    setSaving(false)
    recarregar()
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este abastecimento?')) return
    await api.deleteAbastecimento(id)
    recarregar()
  }

  if (loading && !resumo) return <div className="flex justify-center py-20 text-purple-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Combustível</h1>
          <p className="text-gray-500 text-sm mt-1">Abastecimentos, consumo médio e gasto</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm()) }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo abastecimento'}
        </button>
      </div>

      {/* Resumo */}
      {resumo && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Gasto</p>
            <p className="text-2xl font-bold text-purple-400">{formatBRL(resumo.gastoTotal)}</p>
            <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Consumo médio</p>
            <p className="text-2xl font-bold text-cyan-400">
              {resumo.consumoMedio > 0 ? `${resumo.consumoMedio.toFixed(2)} km/L` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Entre tanques cheios</p>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">KM Calculado</p>
            <p className="text-2xl font-bold text-white">
              {resumo.kmAtualCalculado != null ? `${resumo.kmAtualCalculado.toLocaleString('pt-BR')} km` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Acumulado</p>
          </div>
          <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preço médio L</p>
            <p className="text-2xl font-bold text-white">
              {resumo.valorLitroMedio > 0 ? formatBRL(resumo.valorLitroMedio) : '—'}
            </p>
            {resumo.totalLitros > 0 && (
              <p className="text-xs text-gray-500 mt-1">{resumo.totalLitros.toFixed(2)} L abastecidos</p>
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      {resumo && (
        <div className="flex flex-wrap gap-3 items-center bg-[#16162a] border border-purple-900/30 rounded-xl p-4">
          <span className="text-sm font-semibold text-gray-400">Filtros:</span>
          <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)} className={selectCls}>
            <option value="">Qualquer ano</option>
            {/* Adiciona últimos 5 anos como opções */}
            {Array.from({ length: 5 }).map((_, i) => {
              const ano = new Date().getFullYear() - i;
              return <option key={ano} value={ano}>{ano}</option>
            })}
          </select>
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className={selectCls}>
            <option value="">Todos os meses</option>
            {[
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ].map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          {resumo.postos && resumo.postos.length > 0 && (
            <select value={filtroPosto} onChange={e => setFiltroPosto(e.target.value)} className={selectCls}>
              <option value="">Todos os postos</option>
              {resumo.postos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {resumo.tipos && resumo.tipos.length > 0 && (
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={selectCls}>
              <option value="">Todos os combustíveis</option>
              {resumo.tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-[#16162a] border border-purple-500/30 rounded-xl p-6 transition-all">
          <h2 className="text-sm font-semibold text-purple-400 mb-4">Novo abastecimento</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Data</label>
                <input type="date" value={form.data}
                  onChange={e => setForm(p => ({ ...p, data: e.target.value }))} className={inputCls} />
              </div>
              
              {isPrimeiroAbastecimento ? (
                <div>
                  <label className={labelCls}>KM Total do Carro (Hodômetro)</label>
                  <input type="number" value={form.km}
                    onChange={e => setForm(p => ({ ...p, km: e.target.value }))}
                    placeholder="ex: 152340" className={inputCls} />
                </div>
              ) : (
                <div>
                  <label className={labelCls}>KM andados desde o último</label>
                  <input type="number" value={form.kmAndados}
                    onChange={e => setForm(p => ({ ...p, kmAndados: e.target.value }))}
                    placeholder="ex: 350" className={inputCls} />
                </div>
              )}

              <div>
                <label className={labelCls}>Tipo</label>
                <select value={form.tipoCombustivel}
                  onChange={e => setForm(p => ({ ...p, tipoCombustivel: e.target.value }))} className={inputCls}>
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Gasolina Aditivada</option>
                  <option>Diesel</option>
                  <option>GNV</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Valor total (R$) *</label>
                <input type="number" step="0.01" required value={form.valorTotal}
                  onChange={e => setForm(p => ({ ...p, valorTotal: e.target.value }))}
                  placeholder="ex: 150.00" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Litros (opcional)</label>
                <input type="number" step="0.001" value={form.litros}
                  onChange={e => setForm(p => ({ ...p, litros: e.target.value }))}
                  placeholder="ex: 35.500" className={inputCls} />
              </div>
              
              <div>
                <label className={labelCls}>Posto</label>
                <input type="text" value={form.posto}
                  onChange={e => setForm(p => ({ ...p, posto: e.target.value }))}
                  placeholder="ex: Shell Av. Brasil" className={inputCls} />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.tanqueCheio}
                    onChange={e => setForm(p => ({ ...p, tanqueCheio: e.target.checked }))}
                    className="rounded border-purple-900/40" />
                  Tanque cheio
                </label>
              </div>
              <div className="sm:col-span-3">
                <label className={labelCls}>Observações</label>
                <input type="text" value={form.observacoes}
                  onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} className={inputCls} />
              </div>
            </div>
            
            {form.valorTotal && form.litros && (
              <p className="text-xs text-purple-300 mt-2">
                O valor do litro será calculado automaticamente: {formatBRL(Number(form.valorTotal) / Number(form.litros))} /L
              </p>
            )}

            <button type="submit" disabled={saving}
              className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Salvando...' : 'Registrar abastecimento'}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      {resumo && resumo.abastecimentos.length === 0 ? (
        <div className="bg-[#16162a] border border-purple-900/30 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">⛽</p>
          <p className="text-gray-400">Nenhum abastecimento encontrado.</p>
          <p className="text-xs text-gray-500 mt-2">Registre com tanque cheio pra calcular o consumo médio.</p>
        </div>
      ) : resumo && (
        <div className="space-y-2">
          {resumo.abastecimentos.map((a: Abastecimento) => (
            <div key={a.id} className="bg-[#16162a] border border-purple-900/30 rounded-xl overflow-hidden">
              {editingId !== a.id ? (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">
                        {formatBRL(Number(a.valorTotal))} {a.litros != null ? `· ${Number(a.litros).toFixed(2)} L` : ''}
                      </p>
                      {a.tipoCombustivel && (
                        <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded-full">
                          {a.tipoCombustivel}
                        </span>
                      )}
                      {!a.tanqueCheio && (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Parcial</span>
                      )}
                      {a.kmPorLitro != null && (
                        <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded-full">
                          {Number(a.kmPorLitro).toFixed(2)} km/L
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      <span>{formatDate(a.data)}</span>
                      {a.kmAndados != null ? (
                        <span>+{a.kmAndados} km andados</span>
                      ) : (
                        a.km != null && <span>{a.km.toLocaleString('pt-BR')} km</span>
                      )}
                      {a.valorLitro != null && <span>R$ {Number(a.valorLitro).toFixed(3)}/L</span>}
                      {a.posto && <span>⛽ {a.posto}</span>}
                    </div>
                    {a.observacoes && <p className="text-gray-600 text-xs mt-1">{a.observacoes}</p>}
                  </div>
                  <button onClick={() => { setEditingId(a.id); setEditForm({
                    data: a.data, km: a.km?.toString() ?? '', kmAndados: a.kmAndados?.toString() ?? '', litros: a.litros?.toString() ?? '',
                    valorTotal: String(a.valorTotal),
                    tipoCombustivel: a.tipoCombustivel ?? '', posto: a.posto ?? '',
                    tanqueCheio: a.tanqueCheio, observacoes: a.observacoes ?? ''
                  }) }}
                    className="text-gray-500 hover:text-purple-400 transition-colors px-2">✏️</button>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-600 hover:text-red-400 transition-colors px-2">✕</button>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Editando</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div><label className={labelCls}>Data</label>
                      <input type="date" value={editForm!.data}
                        onChange={e => setEditForm(p => p ? { ...p, data: e.target.value } : null)} className={inputCls} />
                    </div>
                    {a.kmAndados != null ? (
                      <div><label className={labelCls}>KM andados</label>
                        <input type="number" value={editForm!.kmAndados}
                          onChange={e => setEditForm(p => p ? { ...p, kmAndados: e.target.value } : null)} className={inputCls} />
                      </div>
                    ) : (
                      <div><label className={labelCls}>KM (Absoluto)</label>
                        <input type="number" value={editForm!.km}
                          onChange={e => setEditForm(p => p ? { ...p, km: e.target.value } : null)} className={inputCls} />
                      </div>
                    )}
                    <div><label className={labelCls}>Valor total *</label>
                      <input type="number" step="0.01" required value={editForm!.valorTotal}
                        onChange={e => setEditForm(p => p ? { ...p, valorTotal: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Litros</label>
                      <input type="number" step="0.001" value={editForm!.litros}
                        onChange={e => setEditForm(p => p ? { ...p, litros: e.target.value } : null)} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Posto</label>
                      <input type="text" value={editForm!.posto}
                        onChange={e => setEditForm(p => p ? { ...p, posto: e.target.value } : null)} className={inputCls} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input type="checkbox" checked={editForm!.tanqueCheio}
                      onChange={e => setEditForm(p => p ? { ...p, tanqueCheio: e.target.checked } : null)} />
                    Tanque cheio
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(a.id)} disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button onClick={() => { setEditingId(null); setEditForm(null) }}
                      className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

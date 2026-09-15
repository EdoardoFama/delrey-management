import { useState, useMemo } from 'react'
import { csvData } from '../constants/glossarioCarros'

// Função simples para parsear o CSV considerando valores entre aspas
function parseCSV(csv: string) {
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const values = []
    let inQuotes = false
    let currentVal = ''
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim())
        currentVal = ''
      } else {
        currentVal += char
      }
    }
    values.push(currentVal.trim())

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }

  return { headers, rows }
}

const { headers, rows: allRows } = parseCSV(csvData)

export default function Glossario() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [selectedMarca, setSelectedMarca] = useState('')

  // Extrai as categorias únicas
  const categorias = useMemo(() => {
    const cats = new Set(allRows.map((r) => r['Categoria']))
    return Array.from(cats).filter(Boolean).sort()
  }, [])

  // Extrai marcas (a primeira palavra da coluna "Modelo / Versão")
  const marcas = useMemo(() => {
    const m = new Set(
      allRows.map((r) => r['Modelo / Versão']?.split(' ')[0])
    )
    return Array.from(m).filter(Boolean).sort()
  }, [])

  // Filtra as linhas
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const matchSearch = Object.values(row).some((val) =>
        val.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const matchCat = selectedCategoria ? row['Categoria'] === selectedCategoria : true
      const matchMarca = selectedMarca 
        ? row['Modelo / Versão']?.toLowerCase().startsWith(selectedMarca.toLowerCase())
        : true

      return matchSearch && matchCat && matchMarca
    })
  }, [searchTerm, selectedCategoria, selectedMarca])

  return (
    <div className="space-y-6">
      <div className="bg-[#12121e] rounded-xl border border-purple-900/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Glossário Carros</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar em todos os campos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d0d1a] border border-purple-900/40 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full bg-[#0d0d1a] border border-purple-900/40 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <select
            value={selectedMarca}
            onChange={(e) => setSelectedMarca(e.target.value)}
            className="w-full bg-[#0d0d1a] border border-purple-900/40 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="">Todas as Marcas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0d0d1a] text-purple-400">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors"
                  >
                    {headers.map((h, i) => (
                      <td key={i} className="px-4 py-3 whitespace-nowrap">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Nenhum veículo encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-right">
          Mostrando {filteredRows.length} resultados.
        </div>
      </div>
    </div>
  )
}

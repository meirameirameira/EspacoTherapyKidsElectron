import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useToast } from '../common/Toast'

const ESPECIALIDADES = ['Fonoaudiologia', 'Terapia Ocupacional', 'Terapia ABA']

const COR = {
  'Fonoaudiologia':      { bg: '#e8f7f8', border: '#67c2c7', text: '#1a7a7f' },
  'Terapia Ocupacional': { bg: '#f0f8e6', border: '#88bd31', text: '#4a6e10' },
  'Terapia ABA':         { bg: '#f3ecfa', border: '#80529b', text: '#4a2070' },
}

export default function Profissionais() {
  const [lista, setLista]     = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ nome: '', especialidade: 'Fonoaudiologia' })
  const [saving, setSaving]   = useState(false)
  const { addToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      setLista(await window.api.fetchProfissionais())
    } catch {
      addToast('Erro ao carregar profissionais', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nome.trim()) return addToast('Informe o nome do profissional', 'error')
    setSaving(true)
    try {
      const novo = await window.api.createProfissional(form)
      setLista(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)))
      setForm(f => ({ ...f, nome: '' }))
      addToast('Profissional cadastrado!', 'success')
    } catch {
      addToast('Erro ao cadastrar profissional', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await window.api.deleteProfissional(id)
      setLista(prev => prev.filter(p => p.id !== id))
      addToast('Profissional removido', 'success')
    } catch {
      addToast('Erro ao remover profissional', 'error')
    }
  }

  return (
    <div className="prof-page">
      <h2 className="prof-titulo">Profissionais</h2>

      {/* Formulário de cadastro */}
      <form className="prof-form" onSubmit={handleSave}>
        <div className="prof-form-inner">
          <label className="prof-label">
            Nome
            <input
              className="prof-input"
              type="text"
              placeholder="Nome do profissional..."
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            />
          </label>

          <label className="prof-label">
            Especialidade
            <select
              className="prof-select"
              value={form.especialidade}
              onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))}
            >
              {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </label>

          <button type="submit" disabled={saving} className="prof-btn-add">
            <FontAwesomeIcon icon="fa-solid fa-plus" style={{ marginRight: 7 }} />
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="prof-loading">Carregando...</div>
      ) : lista.length === 0 ? (
        <div className="prof-vazio">Nenhum profissional cadastrado.</div>
      ) : (
        <div className="prof-lista">
          {lista.map(prof => {
            const cor = COR[prof.especialidade] ?? COR['Fonoaudiologia']
            return (
              <div key={prof.id} className="prof-card" style={{ borderLeft: `4px solid ${cor.border}` }}>
                <div className="prof-card-info">
                  <span className="prof-card-nome">{prof.nome}</span>
                  <span className="prof-card-esp" style={{ color: cor.text, background: cor.bg }}>
                    {prof.especialidade}
                  </span>
                </div>
                <button
                  className="prof-card-del"
                  onClick={() => handleDelete(prof.id)}
                  title="Remover profissional"
                >
                  <FontAwesomeIcon icon="fa-solid fa-trash" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

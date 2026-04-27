import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useToast } from '../common/Toast'
import { maskPhone, phoneRegex } from '../../utils/phone'

const ESPECIALIDADES = ['Fonoaudiologia', 'Terapia Ocupacional', 'Terapia ABA']

const COR = {
  'Fonoaudiologia':      { bg: '#e8f7f8', border: '#67c2c7', text: '#1a7a7f' },
  'Terapia Ocupacional': { bg: '#f0f8e6', border: '#88bd31', text: '#4a6e10' },
  'Terapia ABA':         { bg: '#f3ecfa', border: '#80529b', text: '#4a2070' },
}

const FORM_VAZIO = { nome: '', telefone: '', email: '', especialidades: [] }

function toggleEsp(arr, esp, checked) {
  return checked ? [...arr, esp] : arr.filter(x => x !== esp)
}

export default function Profissionais() {
  const [lista, setLista]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProf, setEditingProf] = useState(null)
  const [form, setForm]           = useState(FORM_VAZIO)
  const [saving, setSaving]       = useState(false)
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

  function abrirCadastro() {
    setEditingProf(null)
    setForm(FORM_VAZIO)
    setShowModal(true)
  }

  function abrirEdicao(prof) {
    setEditingProf(prof)
    setForm({
      nome:          prof.nome,
      telefone:      maskPhone(prof.telefone ?? ''),
      email:         prof.email ?? '',
      especialidades: [...prof.especialidades],
    })
    setShowModal(true)
  }

  function fecharModal() {
    setShowModal(false)
    setEditingProf(null)
    setForm(FORM_VAZIO)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim())           return addToast('Informe o nome', 'error')
    if (!form.especialidades.length) return addToast('Selecione ao menos uma especialidade', 'error')
    if (form.telefone && !phoneRegex.test(form.telefone))
      return addToast('Telefone inválido — ex: (11) 91234-5678', 'error')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return addToast('Email inválido', 'error')

    const dados = {
      nome:          form.nome.trim(),
      telefone:      form.telefone.trim() || null,
      email:         form.email.trim() || null,
      especialidades: form.especialidades,
    }
    setSaving(true)
    try {
      if (editingProf) {
        const atualizado = await window.api.updateProfissional(editingProf.id, dados)
        setLista(prev =>
          prev.map(p => p.id === editingProf.id ? atualizado : p)
              .sort((a, b) => a.nome.localeCompare(b.nome))
        )
        addToast('Profissional atualizado!', 'success')
      } else {
        const novo = await window.api.createProfissional(dados)
        setLista(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)))
        addToast('Profissional cadastrado!', 'success')
      }
      fecharModal()
    } catch (err) {
      addToast('Erro ao salvar: ' + (err?.message || 'erro desconhecido'), 'error')
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
      <div className="prof-header">
        <h2 className="prof-titulo">Profissionais</h2>
        <button className="agenda-novo-btn" onClick={abrirCadastro}>
          <FontAwesomeIcon icon="fa-solid fa-plus" style={{ marginRight: 8 }} />
          Novo Profissional
        </button>
      </div>

      {loading ? (
        <div className="prof-loading">Carregando...</div>
      ) : lista.length === 0 ? (
        <div className="prof-vazio">Nenhum profissional cadastrado.</div>
      ) : (
        <div className="prof-lista">
          {lista.map(prof => {
            const firstEsp = prof.especialidades[0] ?? 'Fonoaudiologia'
            const cor      = COR[firstEsp] ?? COR['Fonoaudiologia']
            return (
              <div
                key={prof.id}
                className="prof-card"
                style={{ borderLeft: `4px solid ${cor.border}` }}
              >
                <div className="prof-card-info">
                  <span className="prof-card-nome">{prof.nome}</span>
                  <div className="prof-card-esps">
                    {prof.especialidades.map(esp => {
                      const c = COR[esp] ?? COR['Fonoaudiologia']
                      return (
                        <span key={esp} className="prof-card-esp" style={{ color: c.text, background: c.bg }}>
                          {esp}
                        </span>
                      )
                    })}
                  </div>
                  {(prof.telefone || prof.email) && (
                    <div className="prof-card-contato">
                      {prof.telefone && <span>{prof.telefone}</span>}
                      {prof.email    && <span>{prof.email}</span>}
                    </div>
                  )}
                </div>
                <div className="prof-card-actions">
                  <button
                    className="prof-card-edit"
                    onClick={() => abrirEdicao(prof)}
                    title="Editar profissional"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-pen-to-square" />
                  </button>
                  <button
                    className="prof-card-del"
                    onClick={() => handleDelete(prof.id)}
                    title="Remover profissional"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="agenda-modal-overlay" onClick={fecharModal}>
          <div className="agenda-modal prof-modal" onClick={e => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <h3>{editingProf ? 'Editar Profissional' : 'Novo Profissional'}</h3>
              <button className="agenda-modal-close" onClick={fecharModal}>
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="agenda-modal-form">
              <label className="agenda-label">
                Nome *
                <input
                  className="agenda-input"
                  type="text"
                  placeholder="Nome do profissional..."
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  autoFocus
                />
              </label>

              <label className="agenda-label">
                Telefone
                <input
                  className="agenda-input"
                  type="text"
                  placeholder="(11) 91234-5678"
                  value={form.telefone}
                  onChange={e => setForm(f => ({ ...f, telefone: maskPhone(e.target.value) }))}
                  maxLength={15}
                />
              </label>

              <label className="agenda-label">
                Email
                <input
                  className="agenda-input"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </label>

              <div className="agenda-label">
                Especialidades *
                <div className="prof-esp-checks" style={{ marginTop: 6 }}>
                  {ESPECIALIDADES.map(esp => (
                    <label key={esp} className="prof-esp-check-label">
                      <input
                        type="checkbox"
                        checked={form.especialidades.includes(esp)}
                        onChange={e => setForm(f => ({
                          ...f,
                          especialidades: toggleEsp(f.especialidades, esp, e.target.checked),
                        }))}
                      />
                      {esp}
                    </label>
                  ))}
                </div>
              </div>

              <div className="agenda-modal-actions">
                <button type="button" className="agenda-btn-cancel" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingProf ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

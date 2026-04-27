import { useState, useEffect, useCallback, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useToast } from '../common/Toast'
import { getFeriados, chaveData } from '../../utils/feriados'

const DIAS      = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const TERAPIAS  = ['Fonoaudiologia', 'Terapia Ocupacional', 'Terapia ABA']
const MESES     = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CAB_DIAS  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

// JS getDay(): 0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sáb
const DOW_TO_DIA = { 1:'Segunda', 2:'Terça', 3:'Quarta', 4:'Quinta', 5:'Sexta', 6:'Sábado' }

const LABEL_TIPO = { nacional: 'Nacional', estadual: 'SP', municipal: 'Cotia' }

const COR = {
  'Fonoaudiologia':      { bg:'#e8f7f8', border:'#67c2c7', text:'#1a7a7f' },
  'Terapia Ocupacional': { bg:'#f0f8e6', border:'#88bd31', text:'#4a6e10' },
  'Terapia ABA':         { bg:'#f3ecfa', border:'#80529b', text:'#4a2070' },
}

function buildCalendar(year, month) {
  const first   = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const startDow = first.getDay() // 0=Dom

  const days = []
  // Dias do mês anterior para completar a primeira semana
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), curr: false })
  }
  // Dias do mês atual
  for (let d = 1; d <= lastDay; d++) {
    days.push({ date: new Date(year, month, d), curr: true })
  }
  // Dias do mês seguinte para completar a última semana
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    days.push({ date: next, curr: false })
  }
  return days
}

export default function Agenda() {
  const today = new Date()
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth())
  const [slots, setSlots]               = useState([])
  const [pacientes, setPacientes]       = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editingSlot, setEditingSlot]   = useState(null)
  const [form, setForm]                 = useState({ paciente_id:'', dia_semana:'Segunda', horario:'08:00', tipo_terapia:'Fonoaudiologia', profissional_id:'' })
  const [saving, setSaving]             = useState(false)
  const [buscaPac, setBuscaPac]         = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const { addToast } = useToast()

  const pacientesFiltrados = useMemo(
    () => pacientes.filter(p => !buscaPac || p.nome.toLowerCase().includes(buscaPac.toLowerCase())),
    [pacientes, buscaPac]
  )
  const nomeSelecionado = useMemo(
    () => pacientes.find(p => String(p.codigo) === form.paciente_id)?.nome ?? '',
    [pacientes, form.paciente_id]
  )
  const profissionaisDaEsp = useMemo(
    () => profissionais.filter(p => p.especialidades?.includes(form.tipo_terapia)),
    [profissionais, form.tipo_terapia]
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [agendaData, pacientesData, profsData] = await Promise.all([
        window.api.fetchAgenda(),
        window.api.fetchPacientes(),
        window.api.fetchProfissionais(),
      ])
      setSlots(agendaData)
      setPacientes(pacientesData)
      setProfissionais(profsData)
      if (pacientesData.length > 0) {
        setForm(f => f.paciente_id ? f : { ...f, paciente_id: String(pacientesData[0].codigo) })
      }
    } catch {
      addToast('Erro ao carregar agenda', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  function abrirEdicao(slot) {
    setEditingSlot(slot)
    setForm({
      paciente_id:     String(slot.paciente_id),
      dia_semana:      slot.dia_semana,
      horario:         slot.horario,
      tipo_terapia:    slot.tipo_terapia,
      profissional_id: slot.profissional_id ? String(slot.profissional_id) : '',
    })
    setBuscaPac('')
    setShowModal(true)
  }

  function fecharModal() {
    setShowModal(false)
    setEditingSlot(null)
    setBuscaPac('')
    setDropdownAberto(false)
    setForm({ paciente_id:'', dia_semana:'Segunda', horario:'08:00', tipo_terapia:'Fonoaudiologia', profissional_id:'' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.paciente_id) return addToast('Selecione um paciente', 'error')
    if (!form.horario)     return addToast('Informe o horário', 'error')
    const payload = {
      paciente_id:     Number(form.paciente_id),
      dia_semana:      form.dia_semana,
      horario:         form.horario,
      tipo_terapia:    form.tipo_terapia,
      profissional_id: form.profissional_id ? Number(form.profissional_id) : null,
    }
    setSaving(true)
    try {
      if (editingSlot) {
        const atualizado = await window.api.updateAgendaSlot(editingSlot.id, payload)
        setSlots(prev => prev.map(s => s.id === editingSlot.id ? atualizado : s))
      } else {
        const novoSlot = await window.api.createAgendaSlot(payload)
        setSlots(prev => [...prev, novoSlot])
      }
      fecharModal()
      addToast(editingSlot ? 'Horário atualizado!' : 'Horário adicionado!', 'success')
    } catch {
      addToast('Erro ao salvar horário', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await window.api.deleteAgendaSlot(id)
      setSlots(prev => prev.filter(s => s.id !== id))
      addToast('Horário removido', 'success')
    } catch {
      addToast('Erro ao remover horário', 'error')
    }
  }

  const calDays   = buildCalendar(year, month)
  const feriados  = useMemo(() => getFeriados(year), [year])

  const isTodayKey = d =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth()    &&
    d.getDate()     === today.getDate()

  return (
    <div className="agenda-page">
      {/* Cabeçalho */}
      <div className="agenda-header">
        <h2 className="agenda-titulo">Agenda</h2>
        <button className="agenda-novo-btn" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon="fa-solid fa-plus" style={{ marginRight: 8 }} />
          Novo Horário
        </button>
      </div>

      {/* Navegação de mês */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth} title="Mês anterior">
          <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
        </button>
        <div className="cal-mes-bloco">
          <span className="cal-mes-ano">{MESES[month]} {year}</span>
          <button className="cal-hoje-btn" onClick={goToday}>Hoje</button>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth} title="Próximo mês">
          <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
        </button>
      </div>

      {loading ? (
        <div className="agenda-loading">Carregando...</div>
      ) : (
        <div className="cal-wrapper">
          {/* Cabeçalho dos dias da semana */}
          <div className="cal-dow-row">
            {CAB_DIAS.map(d => (
              <div key={d} className="cal-dow-cell">{d}</div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="cal-grid">
            {calDays.map(({ date, curr }, idx) => {
              const dow        = date.getDay()
              const diaNome    = DOW_TO_DIA[dow]
              const daySlots   = diaNome
                ? [...slots.filter(s => s.dia_semana === diaNome)].sort((a, b) => a.horario.localeCompare(b.horario))
                : []
              const isToday    = isTodayKey(date)
              const isDom      = dow === 0
              const feriadosDia = feriados.get(chaveData(date)) ?? []
              const isFeriado  = feriadosDia.length > 0

              return (
                <div
                  key={idx}
                  className={[
                    'cal-day',
                    !curr     ? 'cal-day-fora'     : '',
                    isToday   ? 'cal-day-hoje'     : '',
                    isDom     ? 'cal-day-dom'      : '',
                    isFeriado ? 'cal-day-feriado'  : '',
                  ].join(' ')}
                >
                  <div className="cal-day-top">
                    <span className={`cal-day-num ${isToday ? 'cal-day-num-hoje' : ''}`}>
                      {date.getDate()}
                    </span>

                    {/* Badges de feriado */}
                    {feriadosDia.map((f, i) => (
                      <span
                        key={i}
                        className={`cal-feriado-badge cal-feriado-${f.tipo}`}
                        title={`${f.nome} (${LABEL_TIPO[f.tipo]})`}
                      >
                        {f.nome}
                      </span>
                    ))}
                  </div>

                  <div className="cal-day-slots">
                    {daySlots.map(slot => {
                      const cor = COR[slot.tipo_terapia] ?? COR['Fonoaudiologia']
                      return (
                        <div
                          key={slot.id}
                          className="cal-slot"
                          style={{ background: cor.bg, borderLeft: `3px solid ${cor.border}`, color: cor.text }}
                          title={`${slot.horario} — ${slot.nm_paciente} (${slot.tipo_terapia})${slot.nm_profissional ? ' · ' + slot.nm_profissional : ''}\nClique duplo para editar`}
                          onDoubleClick={e => { e.stopPropagation(); abrirEdicao(slot) }}
                        >
                          <span className="cal-slot-hora">{slot.horario}</span>
                          <span className="cal-slot-nome">{slot.nm_paciente}</span>
                          <button
                            className="cal-slot-del"
                            onClick={() => handleDelete(slot.id)}
                            title="Remover"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal novo horário */}
      {showModal && (
        <div className="agenda-modal-overlay" onClick={fecharModal}>
          <div className="agenda-modal" onClick={e => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <h3>{editingSlot ? 'Editar Horário' : 'Novo Horário'}</h3>
              <button className="agenda-modal-close" onClick={fecharModal}>
                <FontAwesomeIcon icon="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="agenda-modal-form">
              <label className="agenda-label">
                Paciente
                <div className="pac-dropdown-wrapper">
                  <input
                    className="agenda-input"
                    type="text"
                    placeholder="Buscar paciente por nome..."
                    value={dropdownAberto ? buscaPac : nomeSelecionado}
                    onFocus={() => { setDropdownAberto(true); setBuscaPac('') }}
                    onBlur={() => setTimeout(() => setDropdownAberto(false), 150)}
                    onChange={e => { setBuscaPac(e.target.value); setForm(f => ({ ...f, paciente_id: '' })) }}
                    autoComplete="off"
                  />
                  {dropdownAberto && (
                    <div className="pac-dropdown">
                      {pacientesFiltrados.length === 0 ? (
                        <div className="pac-dropdown-vazio">Nenhum paciente encontrado</div>
                      ) : (
                        pacientesFiltrados.map(p => (
                          <div
                            key={p.codigo}
                            className={`pac-dropdown-item ${String(p.codigo) === form.paciente_id ? 'pac-dropdown-item-ativo' : ''}`}
                            onMouseDown={() => {
                              setForm(f => ({ ...f, paciente_id: String(p.codigo) }))
                              setBuscaPac('')
                              setDropdownAberto(false)
                            }}
                          >
                            <span className="pac-codigo">#{p.codigo}</span>
                            {p.nome}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </label>

              <label className="agenda-label">
                Dia da semana
                <select
                  className="agenda-select"
                  value={form.dia_semana}
                  onChange={e => setForm(f => ({ ...f, dia_semana: e.target.value }))}
                >
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              <label className="agenda-label">
                Horário
                <input
                  className="agenda-input"
                  type="time"
                  value={form.horario}
                  onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
                  required
                />
              </label>

              <label className="agenda-label">
                Tipo de terapia
                <select
                  className="agenda-select"
                  value={form.tipo_terapia}
                  onChange={e => setForm(f => ({ ...f, tipo_terapia: e.target.value, profissional_id: '' }))}
                >
                  {TERAPIAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <label className="agenda-label">
                Profissional
                {profissionaisDaEsp.length === 0 ? (
                  <span style={{ fontSize: '0.85em', color: '#aaa', marginTop: 4 }}>
                    Nenhum profissional cadastrado para {form.tipo_terapia}
                  </span>
                ) : (
                  <select
                    className="agenda-select"
                    value={form.profissional_id}
                    onChange={e => setForm(f => ({ ...f, profissional_id: e.target.value }))}
                  >
                    <option value="">Selecione (opcional)...</option>
                    {profissionaisDaEsp.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                )}
              </label>

              <div className="agenda-modal-actions">
                <button type="button" className="agenda-btn-cancel" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingSlot ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

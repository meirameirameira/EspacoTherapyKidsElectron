import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/global.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import logoEspaco from '../assets/logo-cereb.png'

export default function Navbar() {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    const q = term.trim()
    if (!q) return
    const onlyDigits = /^\d+$/.test(q)
    navigate(onlyDigits
      ? `/listar?by=id&q=${encodeURIComponent(q)}`
      : `/listar?by=nome&q=${encodeURIComponent(q)}`)
  }

  function clearSearch() {
    setTerm('')
    navigate('/listar')
  }

  return (
    <nav className="navbar" style={{ WebkitAppRegion: 'drag' }}>
      {/* Logo — no-drag so the link still works */}
      <Link
        className="nav-left"
        to="/listar"
        style={{ display: 'flex', alignItems: 'center', gap: 8, WebkitAppRegion: 'no-drag' }}
      >
        <img src={logoEspaco} alt="Espaço Therapy Kids" style={{ height: 36, width: 'auto', maxWidth: 'none' }} />
      </Link>

      {/* Search — no-drag so inputs/buttons are interactive */}
      <form className="nav-search" onSubmit={onSubmit} style={{ WebkitAppRegion: 'no-drag' }}>
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {term && (
          <button
            type="button"
            onClick={clearSearch}
            title="Limpar busca"
            style={{ borderRadius: 0, background: '#eee', color: '#555', boxShadow: 'none', transform: 'none', margin: 0 }}
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        )}
        <button className="recarregar" type="submit" style={{ margin: 0 }}>
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
        </button>
      </form>

      {/* Right side — novo paciente + window controls */}
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 4, WebkitAppRegion: 'no-drag' }}>
        <button className="wc-btn" onClick={() => window.api.windowMinimize()} title="Minimizar">
          <span className="wc-icon">&#8212;</span>
        </button>
        <button className="wc-btn" onClick={() => window.api.windowMaximize()} title="Maximizar">
          <span className="wc-icon">&#9744;</span>
        </button>
        <button className="wc-btn wc-close" onClick={() => window.api.windowClose()} title="Fechar">
          <span className="wc-icon">&#10005;</span>
        </button>
      </div>
    </nav>
  )
}

import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Menu</span>
          <button className="sidebar-close-btn" onClick={onClose} title="Fechar menu">
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/listar"
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            onClick={onClose}
          >
            <FontAwesomeIcon icon="fa-solid fa-users" className="sidebar-link-icon" />
            Gestão de Pacientes
          </NavLink>

          <NavLink
            to="/agenda"
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            onClick={onClose}
          >
            <FontAwesomeIcon icon="fa-solid fa-calendar-days" className="sidebar-link-icon" />
            Agenda
          </NavLink>

          <NavLink
            to="/profissionais"
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            onClick={onClose}
          >
            <FontAwesomeIcon icon="fa-solid fa-user-doctor" className="sidebar-link-icon" />
            Profissionais
          </NavLink>
        </nav>
      </aside>
    </>
  )
}

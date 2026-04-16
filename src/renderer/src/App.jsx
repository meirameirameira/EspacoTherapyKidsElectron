import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import CreatePatient from './components/patient/CreatePatient'
import ListPatients from './components/patient/ListPatients'
import SearchPatient from './components/patient/SearchPatient'
import UpdatePatient from './components/patient/UpdatePatient'
import DeletePatient from './components/patient/DeletePatient'
import PatientView from './components/patient/PatientView'
import Agenda from './components/agenda/Agenda'
import Profissionais from './components/profissionais/Profissionais'
import { ToastProvider } from './components/common/Toast'
import './styles/global.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Routes>
        <Route path="/" element={<Navigate to="/listar" replace />} />
        <Route path="/cadastrar" element={<CreatePatient />} />
        <Route path="/listar" element={<ListPatients />} />
        <Route path="/pesquisar" element={<SearchPatient />} />
        <Route path="/remover" element={<DeletePatient />} />
        <Route path="/atualizar/:id" element={<UpdatePatient />} />
        <Route path="/visualizar/:id" element={<PatientView />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/profissionais" element={<Profissionais />} />
        <Route path="*" element={<Navigate to="/listar" replace />} />
      </Routes>
    </ToastProvider>
  )
}

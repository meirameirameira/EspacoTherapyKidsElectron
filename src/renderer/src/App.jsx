import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import CreatePatient from './components/patient/CreatePatient'
import ListPatients from './components/patient/ListPatients'
import SearchPatient from './components/patient/SearchPatient'
import UpdatePatient from './components/patient/UpdatePatient'
import DeletePatient from './components/patient/DeletePatient'
import PatientView from './components/patient/PatientView'
import './styles/global.css'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/listar" replace />} />
        <Route path="/cadastrar" element={<CreatePatient />} />
        <Route path="/listar" element={<ListPatients />} />
        <Route path="/pesquisar" element={<SearchPatient />} />
        <Route path="/remover" element={<DeletePatient />} />
        <Route path="/atualizar/:id" element={<UpdatePatient />} />
        <Route path="/visualizar/:id" element={<PatientView />} />
        <Route path="*" element={<Navigate to="/listar" replace />} />
      </Routes>
    </>
  )
}

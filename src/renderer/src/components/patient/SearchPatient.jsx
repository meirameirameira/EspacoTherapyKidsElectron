import React, { useState } from 'react';
import { fetchPacienteById } from '../../api';
import SearchById from '../common/SearchById';
import PacienteTable from './PacienteTable';

export default function SearchPatient() {
  const [id, setId] = useState('');
  const [paciente, setPaciente] = useState(null);

  const handleSearch = async e => {
    e.preventDefault();
    try {
      const data = await fetchPacienteById(id);
      setPaciente(data);
    } catch (err) {
      alert(err.message || 'Erro ao buscar paciente');
      setPaciente(null);
    }
  };

  return (
    <>
      <h2>Pesquisar Paciente</h2>
      <SearchById
        id={id}
        onChangeId={setId}
        onSearch={handleSearch}
      />
      {paciente && <PacienteTable pacientes={[paciente]} />}
    </>
  );
}

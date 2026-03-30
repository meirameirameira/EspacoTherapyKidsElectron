import React, { useState } from 'react';
import { fetchPacienteById, deletePaciente } from '../../api';
import SearchById from '../common/SearchById';
import Button from '../common/Button';
import PacienteTable from './PacienteTable';

export default function RemovePatient() {
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

  const handleRemove = async () => {
    if (!window.confirm('Tem certeza que deseja remover este paciente?')) return;
    try {
      await deletePaciente(paciente.codigo);
      alert('Paciente removido com sucesso.');
      setPaciente(null);
      setId('');
    } catch (err) {
      alert(err.message || 'Erro ao remover paciente');
    }
  };

  return (
    <>
      <h2>Remover Paciente</h2>
      <SearchById
        id={id}
        onChangeId={setId}
        onSearch={handleSearch}
        label="ID do Paciente"
        buttonText="Buscar"
      />

      {paciente && (
        <>
          <PacienteTable pacientes={[paciente]} />

          <div style={{ maxWidth: '400px', margin: '24px auto' }}>
            <Button type="button" variant="danger" onClick={handleRemove}>
              Remover
            </Button>
          </div>
        </>
      )}
    </>
  );
}

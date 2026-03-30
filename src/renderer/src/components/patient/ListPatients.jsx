import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPacientes, deletePaciente, fetchPacienteById, exportPacientesXlsx } from '../../api';
import '../../styles/global.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import logoEspaco from '../../assets/logo.png';

export default function ListPatients() {
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const q  = searchParams.get('q')  ?? '';
  const by = searchParams.get('by') ?? '';

  const load = useCallback(async () => {
    try {
      setError('');

      if (by === 'id' && /^\d+$/.test(q)) {
        try {
          const p = await fetchPacienteById(q);
          setPacientes(p ? [p] : []);
          return;
        } catch (e) {
          setPacientes([]);
          setError(e?.message || 'Paciente não encontrado');
          return;
        }
      }

      const res = await fetchPacientes({ nome: q || undefined });
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      setPacientes([...list].sort((a, b) => (a.codigo ?? 0) - (b.codigo ?? 0)));
    } catch (err) {
      setError(err?.message || 'Falha ao carregar');
      console.error(err);
    }
  }, [q, by]);

  useEffect(() => { load(); }, [load]);

  const remover = async (id) => {
    if (!window.confirm('Confirmar remoção?')) return;
    try {
      await deletePaciente(id);
      await load();
    } catch (err) {
      alert(err?.message || 'Falha ao remover');
    }
  };

  const editar = (paciente) => {
    navigate(`/atualizar/${paciente.codigo}`, { state: { paciente } });
  };
  const ver = (paciente) => {
    navigate(`/visualizar/${paciente.codigo}`, { state: { paciente } });
  };

  const exportar = async () => {
    try {
      await exportPacientesXlsx();
    } catch (err) {
      alert(err?.message || 'Falha ao exportar');
    }
  };

  return (
    <>
      <h2>Pacientes</h2>

      <div className='cadastro'>
        <button className='exportar' onClick={exportar}>Exportar <FontAwesomeIcon icon="fa-solid fa-download" /> </button>
        <button className='recarregar' onClick={() => navigate('/cadastrar')}> <FontAwesomeIcon icon="fa-solid fa-plus" /> Adicionar Paciente </button>
        <button className='buscar' onClick={load}>Recarregar <FontAwesomeIcon icon="fa-solid fa-rotate" /></button>
        {(q || by) && (
          <button onClick={() => navigate('/listar')} style={{ marginLeft: 8 }}>
            Limpar busca
          </button>
        )}
      </div>

      {(q || by) && (
        <p style={{ marginLeft: '20px'}}>
          Filtro ativo: <strong>{by || 'nome'}</strong> = "<em>{q}</em>"
        </p>
      )}

      <div className='tabela-lista'>
        <table className='lista'>
          <thead>
            <tr>
              <th className="table-centro">Código</th>
              <th>Nome Paciente</th>
              <th>Nome Responsável</th>
              <th>Contato Responsável</th>
              <th className="table-centro">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.codigo}>
                <td className="table-centro">{p.codigo}</td>
                <td>{p.nome}</td>
                <td>{p.nmResponsavel}</td>
                <td>{p.nrResponsavel}</td>
                <td className="table-centro">
                  <button className='ver' onClick={() => ver(p)}> Ver <FontAwesomeIcon icon="fa-solid fa-eye"/></button>
                  <button onClick={() => editar(p)}> Editar <FontAwesomeIcon icon="fa-solid fa-pen-to-square" /></button>
                  <button className='deletar' onClick={() => remover(p.codigo)}> Remover <FontAwesomeIcon icon="fa-solid fa-trash" /></button>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}

      <h2><img src={logoEspaco} alt="" /></h2>
    </>
  );
}

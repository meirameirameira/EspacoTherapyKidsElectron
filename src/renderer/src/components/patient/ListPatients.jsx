import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPacientes, deletePaciente, fetchPacienteById, exportPacientesXlsx } from '../../api';
import '../../styles/global.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToast } from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';
import Spinner from '../common/Spinner';

import logoEspaco from '../../assets/logo.png';

const PAGE_SIZE = 10;

export default function ListPatients() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const q  = searchParams.get('q')  ?? '';
  const by = searchParams.get('by') ?? '';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setPage(1);

      if (by === 'id' && /^\d+$/.test(q)) {
        try {
          const p = await fetchPacienteById(q);
          setPacientes(p ? [p] : []);
        } catch (e) {
          setPacientes([]);
          setError(e?.message || 'Paciente não encontrado');
        }
        return;
      }

      const res = await fetchPacientes({ nome: q || undefined });
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      setPacientes([...list].sort((a, b) => (a.codigo ?? 0) - (b.codigo ?? 0)));
    } catch (err) {
      setError(err?.message || 'Falha ao carregar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, by]);

  useEffect(() => { load(); }, [load]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(pacientes.length / PAGE_SIZE)), [pacientes]);
  const paginated  = useMemo(() => pacientes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [pacientes, page]);

  useEffect(() => {
    setPage(p => Math.min(p, totalPages));
  }, [totalPages]);

  const confirmarRemocao = (id) => setConfirmId(id);

  const remover = async () => {
    const idToDelete = confirmId;
    try {
      await deletePaciente(idToDelete);
      setConfirmId(null);
      toast('Paciente removido com sucesso.', 'success');
      setPacientes(prev => prev.filter(p => p.codigo !== idToDelete));
    } catch (err) {
      setConfirmId(null);
      toast(err?.message || 'Falha ao remover paciente.', 'error');
    }
  };

  const exportar = async () => {
    try {
      await exportPacientesXlsx();
      toast('Exportação concluída!', 'success');
    } catch (err) {
      toast(err?.message || 'Falha ao exportar.', 'error');
    }
  };

  const editar = (paciente) => navigate(`/atualizar/${paciente.codigo}`, { state: { paciente } });
  const ver    = (paciente) => navigate(`/visualizar/${paciente.codigo}`, { state: { paciente } });

  return (
    <>
      {confirmId && (
        <ConfirmModal
          message="Deseja remover este paciente? Esta ação não pode ser desfeita."
          confirmLabel="Remover"
          onConfirm={remover}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <h2>Gestão de Pacientes</h2>

      <div className='cadastro'>
        <button className='exportar' onClick={exportar}>
          Exportar <FontAwesomeIcon icon="fa-solid fa-download" />
        </button>
        <button className='recarregar' onClick={() => navigate('/cadastrar')}>
          <FontAwesomeIcon icon="fa-solid fa-plus" /> Adicionar
        </button>
        <button className='buscar' onClick={load}>
          Recarregar <FontAwesomeIcon icon="fa-solid fa-rotate" />
        </button>
      </div>

      {(q || by) && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="filtro-ativo">
            <FontAwesomeIcon icon="fa-solid fa-filter" />
            {by === 'id' ? 'Código' : 'Nome'}: &ldquo;<em>{q}</em>&rdquo;
            <button onClick={() => navigate('/listar')} title="Limpar filtro">
              <FontAwesomeIcon icon="fa-solid fa-xmark" />
            </button>
          </span>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--deletar)', textAlign: 'center', marginTop: 12 }}>{error}</p>
      )}

      <div className='tabela-lista'>
        {loading ? (
          <Spinner />
        ) : (
          <table className='lista'>
            <thead>
              <tr>
                <th className="table-centro" style={{ width: 80 }}>Código</th>
                <th>Nome Paciente</th>
                <th>Responsável</th>
                <th>Contato</th>
                <th className="table-centro" style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.codigo}>
                  <td className="table-centro" style={{ fontWeight: 600, color: 'var(--roxo)' }}>
                    #{p.codigo}
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.nome}</td>
                  <td>{p.nmResponsavel}</td>
                  <td>{p.nrResponsavel}</td>
                  <td className="table-centro">
                    <button className='ver' onClick={() => ver(p)} title="Ver detalhes">
                      <FontAwesomeIcon icon="fa-solid fa-eye" />
                    </button>
                    <button onClick={() => editar(p)} title="Editar paciente">
                      <FontAwesomeIcon icon="fa-solid fa-pen-to-square" />
                    </button>
                    <button className='deletar' onClick={() => confirmarRemocao(p.codigo)} title="Remover paciente">
                      <FontAwesomeIcon icon="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pg-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
          </button>

          <span className="pg-label">{page} / {totalPages}</span>

          <button
            className="pg-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img src={logoEspaco} alt="" style={{ maxWidth: 120, opacity: 0.6 }} />
      </div>
    </>
  );
}

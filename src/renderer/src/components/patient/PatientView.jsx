import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPacienteById } from '../../api';

import { Page, Specializations, FullWidthActions } from '../../styles/SectionsLayout';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import '../../styles/global.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const DIAS_ORDEM = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const COR_TERAPIA = {
  'Fonoaudiologia':      { bg:'#e8f7f8', border:'#67c2c7', text:'#1a7a7f' },
  'Terapia Ocupacional': { bg:'#f0f8e6', border:'#88bd31', text:'#4a6e10' },
  'Terapia ABA':         { bg:'#f3ecfa', border:'#80529b', text:'#4a2070' },
}

const fmtMoney = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n || 0));
const fmtInt = (n) => (n == null ? '—' : Number(n));

function calculaTotais(sessao, { usaHoras = true } = {}) {
  const preco     = Number(sessao?.preco || 0);
  const horas     = Number(sessao?.horas || 0);
  const reembolso = sessao?.reembolsoInformado != null ? Number(sessao.reembolsoInformado) : null;
  const total     = usaHoras ? preco * horas : preco;
  const nf        = reembolso > 0 ? Math.ceil(total / reembolso) : null;
  return { preco, horas, reembolso, total, nf };
}

const TERAPIAS = [
  { key: 'fono', label: 'Fonoaudiologia', color: '#67c2c7', usaHoras: true },
  { key: 'to',   label: 'Terapia Ocupacional', color: '#88bd31', usaHoras: true },
  { key: 'aba',  label: 'Terapia ABA', color: '#80529b', usaHoras: false },
];

function TherapyCard({ label, color, dados, usaHoras }) {
  const ativo = dados.preco > 0;

  return (
    <div style={{
      border: `1.5px solid ${ativo ? color : '#ddd'}`,
      borderLeft: `4px solid ${ativo ? color : '#ccc'}`,
      borderRadius: 10,
      padding: '16px 18px',
      background: ativo ? '#fff' : '#fafafa',
      opacity: ativo ? 1 : 0.55,
      transition: 'opacity 0.2s',
    }}>
      <h4 style={{ margin: '0 0 12px', color: ativo ? color : '#aaa', fontWeight: 700, fontSize: '1em' }}>
        {label}
        {!ativo && <span style={{ fontSize: '0.75em', marginLeft: 8, fontWeight: 400, color: '#bbb' }}>— não ativo</span>}
      </h4>

      {ativo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.95em' }}>
          <Row label={usaHoras ? 'Valor/sessão' : 'Valor do pacote'} value={fmtMoney(dados.preco)} accent={color} />
          {usaHoras && <Row label="Horas de sessão" value={fmtInt(dados.horas)} accent={color} />}
          {usaHoras && <Row label="Total" value={fmtMoney(dados.total)} accent={color} bold />}
          <Row label="Reembolso NF" value={fmtMoney(dados.reembolso)} accent={color} />
          <Row label="Horas para NF" value={fmtInt(dados.nf)} accent={color} bold />
        </div>
      ) : (
        <p style={{ margin: 0, color: '#bbb', fontSize: '0.9em' }}>Terapia não cadastrada.</p>
      )}
    </div>
  );
}

function Row({ label, value, accent, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#666', fontSize: '0.9em' }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: bold ? accent : '#333' }}>{value}</span>
    </div>
  );
}

export default function PatientView() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [paciente, setPaciente]   = useState(null);
  const [erro, setErro]           = useState('');
  const [agendaSlots, setAgendaSlots] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setErro('');
        const [data, todos] = await Promise.all([
          fetchPacienteById(id),
          window.api.fetchAgenda(),
        ]);
        setPaciente(data);
        setAgendaSlots(todos.filter(s => String(s.paciente_id) === String(id)));
      } catch (e) {
        console.error(e);
        setErro(e?.message || 'Falha ao carregar paciente');
      }
    })();
  }, [id]);

  const dados = useMemo(() => {
    if (!paciente) return null;
    return {
      fono: calculaTotais(paciente.fono, { usaHoras: true }),
      to:   calculaTotais(paciente.terapiaOcupacional, { usaHoras: true }),
      aba:  calculaTotais(paciente.aba, { usaHoras: false }),
    };
  }, [paciente]);

  if (erro) return <p style={{ color: 'var(--deletar)', padding: 24, textAlign: 'center' }}>{erro}</p>;
  if (!paciente || !dados) return <Spinner />;

  return (
    <Page>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            onClick={() => navigate('/listar')}
            style={{ background: 'none', color: 'var(--roxo)', boxShadow: 'none', fontWeight: 600, fontSize: '0.9em', padding: '6px 10px' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 6 }} />
            Voltar
          </button>
          <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            {paciente.nome}
          </h2>
          <div style={{ width: 80 }} />
        </div>

        {/* Patient info card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          background: '#fff',
          borderRadius: 10,
          padding: '16px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          marginBottom: 20,
        }}>
          <InfoCell label="Paciente"    value={paciente.nome} />
          <InfoCell label="Responsável" value={paciente.nmResponsavel} />
          <InfoCell label="Contato"     value={paciente.nrResponsavel} />
          {paciente.endereco && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', borderTop: '1px solid #f0eff0', paddingTop: 10, marginTop: 4 }}>
              <div style={{ fontSize: '0.82em', color: '#888', marginBottom: 2 }}>Endereço</div>
              <div style={{ fontWeight: 600, color: '#333' }}>{paciente.endereco}</div>
            </div>
          )}
        </div>

        {/* Therapy cards */}
        <Specializations>
          {TERAPIAS.map(({ key, label, color, usaHoras }) => (
            <TherapyCard key={key} label={label} color={color} dados={dados[key]} usaHoras={usaHoras} />
          ))}
        </Specializations>

        {/* Agenda do paciente */}
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: '#f3f0f8', borderBottom: '2px solid #e0d8ec', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FontAwesomeIcon icon="fa-solid fa-calendar-days" style={{ color: 'var(--roxo)' }} />
            <span style={{ fontWeight: 700, color: 'var(--roxo)', fontSize: '0.97em' }}>Agenda Semanal</span>
          </div>

          {agendaSlots.length === 0 ? (
            <p style={{ margin: 0, padding: '18px 20px', color: '#aaa', fontSize: '0.92em' }}>
              Nenhum horário cadastrado para este paciente.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 16 }}>
              {DIAS_ORDEM.map(dia => {
                const slots = agendaSlots
                  .filter(s => s.dia_semana === dia)
                  .sort((a, b) => a.horario.localeCompare(b.horario));
                if (slots.length === 0) return null;
                return (
                  <div key={dia} style={{ minWidth: 160 }}>
                    <div style={{ fontSize: '0.78em', fontWeight: 700, color: 'var(--roxo)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {dia}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {slots.map(s => {
                        const cor = COR_TERAPIA[s.tipo_terapia] ?? COR_TERAPIA['Fonoaudiologia'];
                        return (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', borderRadius: 5, background: cor.bg, borderLeft: `3px solid ${cor.border}` }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85em', color: '#444' }}>{s.horario}</span>
                            <span style={{ fontSize: '0.8em', color: cor.text, fontWeight: 500 }}>{s.tipo_terapia}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <FullWidthActions>
          <Button
            onClick={() => navigate(`/atualizar/${paciente.codigo}`, { state: { paciente } })}
            style={{ width: 200 }}
          >
            Editar <FontAwesomeIcon icon={faPenToSquare} style={{ marginLeft: 8 }} />
          </Button>
        </FullWidthActions>
      </div>
    </Page>
  );
}

function InfoCell({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.82em', color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, color: '#333' }}>{value ?? '—'}</div>
    </div>
  );
}

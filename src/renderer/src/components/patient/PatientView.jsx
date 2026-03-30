import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPacienteById } from '../../api';

import { Page, Specializations, SpecSection, FullWidthActions } from '../../styles/SectionsLayout';
import Button from '../common/Button';
import '../../styles/global.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const fmtMoney = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n || 0));
const fmtInt = (n) => (n == null ? '—' : Number(n));

function calculaTotais(sessao, { usaHoras = true } = {}) {
  const preco = Number(sessao?.preco || 0);
  const horas = Number(sessao?.horas || 0);
  const reembolso = Number(sessao?.reembolsoInformado || 0);

  const total = usaHoras ? preco * horas : preco;
  const nf = reembolso > 0 ? Math.ceil(total / (usaHoras ? reembolso : reembolso)) : 0;

  return { preco, horas, reembolso, total, nf };
}

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setErro('');
        const data = await fetchPacienteById(id);
        setPaciente(data);
      } catch (e) {
        console.error(e);
        setErro(e?.message || 'Falha ao carregar paciente');
      }
    })();
  }, [id]);

  const dados = useMemo(() => {
    if (!paciente) return null;
    const fono = calculaTotais(paciente.fono, { usaHoras: true });
    const to   = calculaTotais(paciente.terapiaOcupacional, { usaHoras: true });
    const aba  = calculaTotais(paciente.aba, { usaHoras: false });
    return { fono, to, aba };
  }, [paciente]);

  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;
  if (!paciente || !dados) return <p>Carregando…</p>;

  return (
    <Page>
      <h2 style={{ textAlign: 'center', marginBottom: 12 }}>
        Paciente: {paciente.nome}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          maxWidth: 1100,
          margin: '0 auto 16px',
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        <div>
          <div style={{ opacity: 0.7 }}>Nome</div>
          <div style={{ fontWeight: 700 }}>{paciente.nome ?? '—'}</div>
        </div>
        <div>
          <div style={{ opacity: 0.7 }}>Nome do Responsável</div>
          <div style={{ fontWeight: 700 }}>{paciente.nmResponsavel ?? '—'}</div>
        </div>
        <div>
          <div style={{ opacity: 0.7 }}>Contato do Responsável</div>
          <div style={{ fontWeight: 700 }}>{paciente.nrResponsavel ?? '—'}</div>
        </div>
      </div>

      <Specializations>
        <SpecSection>
          <h4 style={{ margin: 0 }}>Fonoaudiologia</h4>
          <div>Valor Sessão: {fmtMoney(dados.fono.preco)}</div>
          <div>Horas de Sessão: {fmtInt(dados.fono.horas)}</div>
          <div>Total: {fmtMoney(dados.fono.total)}</div>
          <div>Reembolso de Nota Fiscal: {fmtMoney(dados.fono.reembolso)}</div>
          <div>Horas para Notas Fiscais: {fmtInt(dados.fono.nf)}</div>
        </SpecSection>

        <SpecSection>
          <h4 style={{ margin: 0 }}>Terapia Ocupacional</h4>
          <div>Valor Sessão: {fmtMoney(dados.to.preco)}</div>
          <div>Horas de Sessão: {fmtInt(dados.to.horas)}</div>
          <div>Total: {fmtMoney(dados.to.total)}</div>
          <div>Reembolso de Nota Fiscal: {fmtMoney(dados.to.reembolso)}</div>
          <div>Horas para Notas Fiscais: {fmtInt(dados.to.nf)}</div>
        </SpecSection>

        <SpecSection>
          <h4 style={{ margin: 0 }}>ABA</h4>
          <div>Valor do pacote: {fmtMoney(dados.aba.preco)}</div>
          <div>Reembolso de Nota Fiscal: {fmtMoney(dados.aba.reembolso)}</div>
          <div>Horas para Notas Fiscais: {fmtInt(dados.aba.nf)}</div>
        </SpecSection>
      </Specializations>

      <FullWidthActions>
        <Button
          onClick={() => navigate(`/atualizar/${paciente.codigo}`, { state: { paciente } })}
        >
          Editar <FontAwesomeIcon icon={faPenToSquare} style={{ marginLeft: 8 }} />
        </Button>
      </FullWidthActions>
    </Page>
  );
}

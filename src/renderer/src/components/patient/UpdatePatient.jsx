import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import InputField from '../common/InputField';
import Button from '../common/Button';
import { fetchPacienteById, updatePaciente } from '../../api';
import '../../styles/global.css';

import {
  Page,
  LargeForm,
  FormInner,
  Specializations,
  SpecSection,
  FullWidthActions,
} from '../../styles/SectionsLayout';

const schema = Yup.object({
  nome: Yup.string().required('Obrigatório'),
  nrResponsavel: Yup.number().typeError('Número inválido').positive().required('Obrigatório'),
  nmResponsavel: Yup.string().required('Obrigatório'),
});

export default function UpdatePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [paciente, setPaciente] = useState(state?.paciente || null);
  const [loading, setLoading] = useState(!state?.paciente);

  useEffect(() => {
    if (paciente) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPacienteById(id);
        setPaciente(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, paciente]);

  const initialValues = useMemo(
    () => ({
      nome: paciente?.nome || '',
      nrResponsavel: paciente?.nrResponsavel ?? '',
      nmResponsavel: paciente?.nmResponsavel || '',
      fonoEnabled: !!(paciente?.fono?.preco > 0 && paciente?.fono?.horas > 0),
      fonoPreco: paciente?.fono?.preco ?? '',
      fonoHoras: paciente?.fono?.horas ?? '',
      fonoReembolso: paciente?.fono?.reembolsoInformado ?? '',
      toEnabled: !!(paciente?.terapiaOcupacional?.preco > 0 && paciente?.terapiaOcupacional?.horas > 0),
      toPreco: paciente?.terapiaOcupacional?.preco ?? '',
      toHoras: paciente?.terapiaOcupacional?.horas ?? '',
      toReembolso: paciente?.terapiaOcupacional?.reembolsoInformado ?? '',
      abaEnabled: !!(paciente?.aba?.preco > 0),
      abaPreco: paciente?.aba?.preco ?? '',
      abaReembolso: paciente?.aba?.reembolsoInformado ?? '',
    }),
    [paciente]
  );

  if (loading) return <p>Carregando…</p>;
  if (!paciente) return <p>Paciente não encontrado.</p>;

  return (
    <Page>
      <h2 style={{ textAlign: 'center' }}>Editar Paciente #{id}</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        enableReinitialize
        onSubmit={async (vals, { setSubmitting }) => {
          const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
          const payload = {
            nome: vals.nome?.trim(),
            nmResponsavel: vals.nmResponsavel?.trim(),
            nrResponsavel: Number(vals.nrResponsavel),
            fono: vals.fonoEnabled
              ? { preco: toNum(vals.fonoPreco), horas: Math.max(1, Number(vals.fonoHoras)), reembolsoInformado: toNum(vals.fonoReembolso) }
              : { preco: 0, horas: 0, reembolsoInformado: 0 },
            terapiaOcupacional: vals.toEnabled
              ? { preco: toNum(vals.toPreco), horas: Math.max(1, Number(vals.toHoras)), reembolsoInformado: toNum(vals.toReembolso) }
              : { preco: 0, horas: 0, reembolsoInformado: 0 },
            aba: vals.abaEnabled
              ? { preco: toNum(vals.abaPreco), horas: 1, reembolsoInformado: toNum(vals.abaReembolso) }
              : { preco: 0, horas: 1, reembolsoInformado: 0 },
          };

          try {
            await updatePaciente(id, payload);
            alert('Paciente atualizado com sucesso!');
            navigate('/listar');
          } catch (error) {
            console.error('Erro ao atualizar paciente', error);
            alert('Falha ao atualizar paciente: ' + (error?.message || 'Erro desconhecido'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, handleSubmit, isSubmitting, setFieldValue }) => (
          <LargeForm onSubmit={handleSubmit}>
            <FormInner>
              <InputField name="nome" label="Nome" />
              <InputField name="nrResponsavel" label="Número do Responsável" type="number" />
              <InputField name="nmResponsavel" label="Nome do Responsável" />

              <Specializations>
                <SpecSection>
                  <label>
                    <Field
                      type="checkbox"
                      name="fonoEnabled"
                      checked={values.fonoEnabled}
                      onChange={() => setFieldValue('fonoEnabled', !values.fonoEnabled)}
                    />{' '}
                    Fonoaudiologia
                  </label>
                  <InputField name="fonoPreco" label="Valor sessão (R$)" type="number" disabled={!values.fonoEnabled} />
                  <InputField name="fonoHoras" label="Horas de sessão" type="number" disabled={!values.fonoEnabled} />
                  <InputField name="fonoReembolso" label="Reembolso informado" type="number" disabled={!values.fonoEnabled} />
                </SpecSection>

                <SpecSection>
                  <label>
                    <Field
                      type="checkbox"
                      name="toEnabled"
                      checked={values.toEnabled}
                      onChange={() => setFieldValue('toEnabled', !values.toEnabled)}
                    />{' '}
                    Terapia Ocupacional
                  </label>
                  <InputField name="toPreco" label="Valor sessão (R$)" type="number" disabled={!values.toEnabled} />
                  <InputField name="toHoras" label="Horas de sessão" type="number" disabled={!values.toEnabled} />
                  <InputField name="toReembolso" label="Reembolso informado" type="number" disabled={!values.toEnabled} />
                </SpecSection>

                <SpecSection>
                  <label>
                    <Field
                      type="checkbox"
                      name="abaEnabled"
                      checked={values.abaEnabled}
                      onChange={() => setFieldValue('abaEnabled', !values.abaEnabled)}
                    />{' '}
                    Terapia ABA
                  </label>
                  <InputField name="abaPreco" label="Valor do pacote (R$)" type="number" disabled={!values.abaEnabled} />
                  <InputField name="abaReembolso" label="Reembolso informado" type="number" disabled={!values.abaEnabled} />
                </SpecSection>
              </Specializations>

              <FullWidthActions>
                <Button style={{width: '200px'}} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </FullWidthActions>
            </FormInner>
          </LargeForm>
        )}
      </Formik>
    </Page>
  );
}

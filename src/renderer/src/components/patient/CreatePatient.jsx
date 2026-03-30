import React from 'react';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { createPaciente } from '../../api';
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
  nrResponsavel: Yup.string().required('Obrigatório'),
  nmResponsavel: Yup.string().required('Obrigatório'),
  fonoEnabled: Yup.boolean(),
  fonoPreco: Yup.number().when('fonoEnabled', {
    is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  fonoHoras: Yup.number().when('fonoEnabled', {
    is: true, then: s => s.integer().positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  fonoReembolso: Yup.number().when('fonoEnabled', {
    is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  toEnabled: Yup.boolean(),
  toPreco: Yup.number().when('toEnabled', {
    is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  toHoras: Yup.number().when('toEnabled', {
    is: true, then: s => s.integer().positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  toReembolso: Yup.number().when('toEnabled', {
    is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  abaEnabled: Yup.boolean(),
  abaPreco: Yup.number().when('abaEnabled', {
    is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
  abaReembolso: Yup.number().when('abaEnabled', {
    is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired()
  }),
});

export default function CreatePatient() {
  return (
    <Page>
      <h2 style={{ textAlign: 'center' }}>Cadastrar Paciente</h2>

      <Formik
        initialValues={{
          nome: '',
          nrResponsavel: '',
          nmResponsavel: '',
          fonoEnabled: false,
          fonoPreco: '',
          fonoHoras: '',
          fonoReembolso: '',
          toEnabled: false,
          toPreco: '',
          toHoras: '',
          toReembolso: '',
          abaEnabled: false,
          abaPreco: '',
          abaReembolso: '',
        }}
        validationSchema={schema}
        onSubmit={async (vals, { resetForm }) => {
          const toNum = (v) =>
            v === '' || v === null || v === undefined ? undefined : Number(v);

          const paciente = {
            nome: vals.nome?.trim(),
            nmResponsavel: vals.nmResponsavel?.trim(),
            nrResponsavel: Number(vals.nrResponsavel),
            fono: vals.fonoEnabled
              ? {
                  preco: toNum(vals.fonoPreco),
                  horas: Math.max(1, Number(vals.fonoHoras)),
                  reembolsoInformado: toNum(vals.fonoReembolso),
                }
              : { preco: 0, horas: 0, reembolsoInformado: 1 },
            terapiaOcupacional: vals.toEnabled
              ? {
                  preco: toNum(vals.toPreco),
                  horas: Math.max(1, Number(vals.toHoras)),
                  reembolsoInformado: toNum(vals.toReembolso),
                }
              : { preco: 0, horas: 0, reembolsoInformado: 1 },
            aba: vals.abaEnabled
              ? {
                  preco: toNum(vals.abaPreco),
                  horas: 1,
                  reembolsoInformado: toNum(vals.abaReembolso),
                }
              : { preco: 0, horas: 1, reembolsoInformado: 1 },
          };

          try {
            await createPaciente(paciente);
            alert('Paciente cadastrado com sucesso!');
            resetForm();
          } catch (error) {
            console.error('Erro ao criar paciente', error);
            alert('Falha ao cadastrar paciente: ' + error.message);
          }
        }}
      >
        {({ values, handleSubmit, isSubmitting, setFieldValue }) => (
          <LargeForm onSubmit={handleSubmit}>
            <FormInner>
              <InputField name="nome" label="Nome" />
              <InputField name="nrResponsavel" label="Número do Responsável" type="text" />
              <InputField name="nmResponsavel" label="Nome do Responsável" />

              <Specializations>
                <SpecSection>
                  <label>
                    <Field
                      type="checkbox"
                      name="fonoEnabled"
                      checked={values.fonoEnabled}
                      onChange={() =>
                        setFieldValue('fonoEnabled', !values.fonoEnabled)
                      }
                    />{' '}
                    Fonoaudiologia
                  </label>
                  <InputField
                    name="fonoPreco"
                    label="Valor sessão (R$)"
                    type="number"
                    disabled={!values.fonoEnabled}
                  />
                  <InputField
                    name="fonoHoras"
                    label="Horas de sessão"
                    type="number"
                    disabled={!values.fonoEnabled}
                  />
                  <InputField
                    name="fonoReembolso"
                    label="Reembolso informado"
                    type="number"
                    disabled={!values.fonoEnabled}
                  />
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
                  <InputField
                    name="toPreco"
                    label="Valor sessão (R$)"
                    type="number"
                    disabled={!values.toEnabled}
                  />
                  <InputField
                    name="toHoras"
                    label="Horas de sessão"
                    type="number"
                    disabled={!values.toEnabled}
                  />
                  <InputField
                    name="toReembolso"
                    label="Reembolso informado"
                    type="number"
                    disabled={!values.toEnabled}
                  />
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
                  <InputField
                    name="abaPreco"
                    label="Valor do pacote (R$)"
                    type="number"
                    disabled={!values.abaEnabled}
                  />
                  <InputField
                    name="abaReembolso"
                    label="Reembolso informado"
                    type="number"
                    disabled={!values.abaEnabled}
                  />
                </SpecSection>
              </Specializations>

              <FullWidthActions>
                <Button style={{width: '200px'}} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Cadastrar'}
                </Button>
              </FullWidthActions>
            </FormInner>
          </LargeForm>
        )}
      </Formik>
    </Page>
  );
}

import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { createPaciente } from '../../api';
import { useToast } from '../common/Toast';
import { maskPhone, phoneRegex } from '../../utils/phone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
  nome:          Yup.string().required('Obrigatório'),
  nrResponsavel: Yup.string().required('Obrigatório').matches(phoneRegex, 'Ex: (11) 91234-5678'),
  nmResponsavel: Yup.string().required('Obrigatório'),
  endereco:      Yup.string().nullable(),
  fonoEnabled:   Yup.boolean(),
  fonoPreco:     Yup.number().when('fonoEnabled', { is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired() }),
  fonoHoras:     Yup.number().when('fonoEnabled', { is: true, then: s => s.integer().positive().required('Obrigatório'), otherwise: s => s.notRequired() }),
  fonoReembolso: Yup.number().min(0).nullable().notRequired(),
  toEnabled:     Yup.boolean(),
  toPreco:       Yup.number().when('toEnabled', { is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired() }),
  toHoras:       Yup.number().when('toEnabled', { is: true, then: s => s.integer().positive().required('Obrigatório'), otherwise: s => s.notRequired() }),
  toReembolso:   Yup.number().min(0).nullable().notRequired(),
  abaEnabled:    Yup.boolean(),
  abaPreco:      Yup.number().when('abaEnabled', { is: true, then: s => s.positive().required('Obrigatório'), otherwise: s => s.notRequired() }),
  abaReembolso:  Yup.number().min(0).nullable().notRequired(),
});

export default function CreatePatient() {
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <Page>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={() => navigate('/listar')}
          style={{ background: 'none', color: 'var(--roxo)', boxShadow: 'none', fontWeight: 600, fontSize: '0.9em', padding: '6px 10px' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 6 }} />
          Voltar
        </button>
        <h2 style={{ flex: 1, textAlign: 'center', margin: 0 }}>Cadastrar Paciente</h2>
        <div style={{ width: 80 }} />
      </div>

      <Formik
        initialValues={{
          nome: '', nrResponsavel: '', nmResponsavel: '', endereco: '',
          fonoEnabled: false, fonoPreco: '', fonoHoras: '', fonoReembolso: '',
          toEnabled:   false, toPreco:   '', toHoras:   '', toReembolso:   '',
          abaEnabled:  false, abaPreco:  '',               abaReembolso:  '',
        }}
        validationSchema={schema}
        onSubmit={async (vals, { resetForm }) => {
          const toNum = (v) => (v === '' || v == null) ? null : Number(v);

          const paciente = {
            nome:          vals.nome?.trim(),
            nmResponsavel: vals.nmResponsavel?.trim(),
            nrResponsavel: vals.nrResponsavel,
            endereco:      vals.endereco?.trim() || null,
            fono: vals.fonoEnabled
              ? { preco: toNum(vals.fonoPreco), horas: Math.max(1, Number(vals.fonoHoras)), reembolsoInformado: toNum(vals.fonoReembolso) }
              : { preco: 0, horas: 0, reembolsoInformado: null },
            terapiaOcupacional: vals.toEnabled
              ? { preco: toNum(vals.toPreco), horas: Math.max(1, Number(vals.toHoras)), reembolsoInformado: toNum(vals.toReembolso) }
              : { preco: 0, horas: 0, reembolsoInformado: null },
            aba: vals.abaEnabled
              ? { preco: toNum(vals.abaPreco), horas: 1, reembolsoInformado: toNum(vals.abaReembolso) }
              : { preco: 0, horas: 1, reembolsoInformado: null },
          };

          try {
            await createPaciente(paciente);
            toast('Paciente cadastrado com sucesso!', 'success');
            resetForm();
          } catch (error) {
            console.error('Erro ao criar paciente', error);
            toast('Falha ao cadastrar: ' + error.message, 'error');
          }
        }}
      >
        {({ values, handleSubmit, isSubmitting, setFieldValue }) => (
          <LargeForm onSubmit={handleSubmit}>
            <FormInner>
              <InputField name="nome"          label="Nome do Paciente" />
              <InputField name="nmResponsavel" label="Nome do Responsável" />
              <InputField name="nrResponsavel" label="Contato do Responsável" type="text"
                onChange={e => setFieldValue('nrResponsavel', maskPhone(e.target.value))}
                maxLength={15} />
              <InputField name="endereco"      label="Endereço" />

              <Specializations>
                <SpecSection active={values.fonoEnabled} color="#67c2c7">
                  <label>
                    <Field
                      type="checkbox"
                      name="fonoEnabled"
                      checked={values.fonoEnabled}
                      onChange={() => setFieldValue('fonoEnabled', !values.fonoEnabled)}
                    />
                    Fonoaudiologia
                  </label>
                  <InputField name="fonoPreco"     label="Valor sessão (R$)"  type="number" disabled={!values.fonoEnabled} />
                  <InputField name="fonoHoras"     label="Horas de sessão"    type="number" disabled={!values.fonoEnabled} />
                  <InputField name="fonoReembolso" label="Reembolso informado" type="number" disabled={!values.fonoEnabled} />
                </SpecSection>

                <SpecSection active={values.toEnabled} color="#88bd31">
                  <label>
                    <Field
                      type="checkbox"
                      name="toEnabled"
                      checked={values.toEnabled}
                      onChange={() => setFieldValue('toEnabled', !values.toEnabled)}
                    />
                    Terapia Ocupacional
                  </label>
                  <InputField name="toPreco"     label="Valor sessão (R$)"  type="number" disabled={!values.toEnabled} />
                  <InputField name="toHoras"     label="Horas de sessão"    type="number" disabled={!values.toEnabled} />
                  <InputField name="toReembolso" label="Reembolso informado" type="number" disabled={!values.toEnabled} />
                </SpecSection>

                <SpecSection active={values.abaEnabled} color="#80529b">
                  <label>
                    <Field
                      type="checkbox"
                      name="abaEnabled"
                      checked={values.abaEnabled}
                      onChange={() => setFieldValue('abaEnabled', !values.abaEnabled)}
                    />
                    Terapia ABA
                  </label>
                  <InputField name="abaPreco"     label="Valor do pacote (R$)" type="number" disabled={!values.abaEnabled} />
                  <InputField name="abaReembolso" label="Reembolso informado"  type="number" disabled={!values.abaEnabled} />
                </SpecSection>
              </Specializations>

              <FullWidthActions>
                <Button style={{ width: 200 }} type="submit" disabled={isSubmitting}>
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

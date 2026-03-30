import React from 'react';
import FormWrapper from './FormWrapper';
import { Label, Input } from './styled';
import Button from './Button';

export default function SearchById({
  id,
  onChangeId,
  onSearch,
  label = 'ID do Paciente',
  buttonText = 'Buscar',
}) {
  return (
    <FormWrapper onSubmit={onSearch}>
      <Label htmlFor="searchId"><strong>{label}</strong></Label>
      <Input
        id="searchId"
        type="text"
        value={id}
        onChange={e => onChangeId(e.target.value)}
      />
      <Button type="submit">{buttonText}</Button>
    </FormWrapper>
  );
}

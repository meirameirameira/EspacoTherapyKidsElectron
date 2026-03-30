import React from 'react';
import { useField } from 'formik';
import { Label, Input, ErrorText } from '../../styles/formStyles';

export default function InputField({ label, ...props }) {
  const [field, meta] = useField(props.name);
  return (
    <div style={{ width: '100%' }}>
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} {...field} {...props} />
      {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
    </div>
  );
}

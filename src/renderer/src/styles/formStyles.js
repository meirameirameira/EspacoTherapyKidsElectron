import styled from 'styled-components';

export const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.92em;
  color: #4a4a4a;
`;

export const Input = styled.input`
  padding: 9px 11px;
  font-size: 0.97rem;
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #d4cbe3;
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  outline: none;

  &:focus {
    border-color: #80529b;
    box-shadow: 0 0 0 3px rgba(128, 82, 155, 0.15);
  }

  &:disabled {
    background: #f5f4f7;
    color: #aaa;
    border-color: #e5e0ec;
    cursor: not-allowed;
  }
`;

export const ErrorText = styled.div`
  color: #c0392b;
  font-size: 0.82rem;
  margin-top: 3px;
  font-weight: 500;
`;

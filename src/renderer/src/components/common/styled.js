import styled from 'styled-components';

export const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 300px;
  margin: 0 auto;
`;

export const Label = styled.label`
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const Button = styled.button`
  padding: 0.75rem;
  font-weight: bold;
  background-color: #e72d7e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #999;
    cursor: not-allowed;
  }
`;

import styled from 'styled-components';

const Button = styled.button`
  width: 50%;
  padding: 12px;
  color: #fff;
  background-color: ${props =>
    props.variant === 'danger' ? '#e74c3c' : '#e72d7e'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background-color: ${props =>
      props.variant === 'danger' ? '#c0392b' : '#b4195d'};
  }
`;

export default Button;

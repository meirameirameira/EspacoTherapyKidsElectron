import styled from 'styled-components';

export const Page = styled.div`
  width: 100%;
  padding: 16px 12px 40px;
`;

export const LargeForm = styled.form`
  max-width: 1100px;
  margin: 0 auto;
`;

export const FormInner = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

export const Specializations = styled.div`
  max-width: 100%;
  margin: 4px 0 0;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const SpecSection = styled.div`
  border: 1.5px solid ${props => props.active ? props.color || '#80529b' : '#e5e7eb'};
  border-left: 4px solid ${props => props.active ? props.color || '#80529b' : '#ddd'};
  border-radius: 8px;
  padding: 14px;
  background: ${props => props.active ? '#fff' : '#fafafa'};
  min-width: 0;
  transition: border-color 0.2s ease, opacity 0.2s ease, background 0.2s ease;
  opacity: ${props => props.active ? 1 : 0.65};

  label {
    font-weight: 700;
    font-size: 0.95em;
    color: ${props => props.active ? props.color || '#80529b' : '#888'};
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    user-select: none;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${props => props.color || '#80529b'};
    cursor: pointer;
    border: none;
    box-shadow: none;
  }

  input[type="checkbox"]:focus {
    outline: none;
    box-shadow: none;
  }
`;

export const FullWidthActions = styled.div`
  max-width: 1100px;
  margin: 16px auto 0;
  display: flex;
  justify-content: center;
  gap: 12px;
`;

import styled from 'styled-components';

export const TableContainer = styled.div`
  display: flex;
  justify-content: center;
  overflow-x: auto;
  margin-bottom: 24px;
`;

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Th = styled.th`
  padding: 8px;
  background-color: #f5f5f5;
  text-align: center;
  border: 1px solid #ddd;
`;

export const Td = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
`;

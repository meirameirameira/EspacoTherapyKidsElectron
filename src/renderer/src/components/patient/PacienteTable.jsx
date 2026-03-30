import React from 'react';
import { TableContainer, Table, Th, Td } from '../common/Table';
import { pacienteColumns } from './pacienteColumns';
import { showOrDash } from '../../utils/format';

export default function PacienteTable({ pacientes }) {
  const rows = (pacientes && pacientes.length > 0)
    ? pacientes
    : Array.from({ length: 3 }, () => null);

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            {pacienteColumns.map(col => (
              <Th key={col.key}>{col.label}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p, rowIdx) => (
            <tr key={rowIdx}>
              {pacienteColumns.map(col => {
                if (!p) {
                  return <Td key={col.key}>—</Td>;
                }
                const raw = col.computed ? col.computed(p) : p[col.key];
                return (
                  <Td key={col.key}>
                    {showOrDash(raw, col.decimals)}
                  </Td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

import React from 'react';

export default function Spinner({ size = 40 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <div
        className="spinner"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}

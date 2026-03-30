import React from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = true }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>Cancelar</button>
          <button className={danger ? 'deletar modal-confirm' : 'modal-confirm'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

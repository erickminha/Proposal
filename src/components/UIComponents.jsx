import React from 'react';

export const LoadingSpinner = ({ message = 'Carregando...', size = 24, color = '#3b82f6' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}>
    <div className="spinner" style={{ 
      width: size, 
      height: size, 
      border: `3px solid ${color}33`, 
      borderTop: `3px solid ${color}`, 
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    {message && <span style={{ fontSize: 14, color: '#64748b' }}>{message}</span>}
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const Alert = ({ message, type, icon, onDismiss }) => {
  const colors = {
    error: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    success: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    warning: { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' }
  };
  const style = colors[type] || colors.success;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: 8,
      backgroundColor: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      marginBottom: 16,
      fontSize: 14
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span>{icon}</span>}
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18 }}>
          &times;
        </button>
      )}
    </div>
  );
};

export const ErrorMessage = (props) => <Alert {...props} type="error" icon="⚠️" />;
export const SuccessMessage = (props) => <Alert {...props} type="success" icon="✅" />;
export const WarningMessage = (props) => <Alert {...props} type="warning" icon="🔔" />;

export const EmptyState = ({ icon = '📭', title, message, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>{title}</h3>
    <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, maxWidth: 300 }}>{message}</p>
    {action && (
      <button 
        onClick={action.onClick}
        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
      >
        {action.label}
      </button>
    )}
  </div>
);

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onCancel} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{cancelText}</button>
          <button onClick={onConfirm} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export const StatusBadge = ({ status, color, size = 'md' }) => {
  const sizes = {
    sm: { padding: '2px 8px', fontSize: 10 },
    md: { padding: '4px 12px', fontSize: 12 },
    lg: { padding: '6px 16px', fontSize: 14 }
  };
  const s = sizes[size] || sizes.md;
  
  const defaultColors = {
    'Aceita': '#10b981',
    'Rascunho': '#64748b',
    'Pendente': '#f59e0b',
    'Recusada': '#ef4444'
  };
  const bgColor = color || defaultColors[status] || '#64748b';

  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: `${bgColor}15`,
      color: bgColor,
      border: `1px solid ${bgColor}33`,
      borderRadius: 20,
      fontWeight: 700,
      ...s
    }}>
      {status}
    </span>
  );
};

export const ProgressBar = ({ percentage, color = '#3b82f6', height = 8 }) => (
  <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: 10, height, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: color, height: '100%', transition: 'width 0.3s ease' }} />
  </div>
);

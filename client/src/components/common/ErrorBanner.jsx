import { useApp } from '../../context/AppContext';

const style = {
  position: 'fixed',
  top: 'calc(var(--filter-bar-height) + 8px)',
  left: '12px',
  right: '12px',
  zIndex: 'var(--z-overlay)',
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
};

export default function ErrorBanner() {
  const { state, dispatch } = useApp();
  if (!state.error) return null;
  return (
    <div style={style}>
      <span>⚠ {state.error}</span>
      <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
        style={{ fontWeight: 700, color: 'inherit', fontSize: '16px' }}>✕</button>
    </div>
  );
}

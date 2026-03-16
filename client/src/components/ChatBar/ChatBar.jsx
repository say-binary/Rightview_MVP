import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useQueryParser } from '../../hooks/useQueryParser';
import { QUERY_SUGGESTIONS } from '../../utils/constants';
import styles from './ChatBar.module.css';

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M16 9L2 2L5.5 9L2 16L16 9Z" fill="currentColor"/>
    </svg>
  );
}

export default function ChatBar() {
  const { state, dispatch } = useApp();
  const { parsedQueryChips, chatQuery } = state;
  const { submit } = useQueryParser();
  const [text, setText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    const val = text.trim();
    if (!val) return;
    setHasSubmitted(true);
    setText('');
    dispatch({ type: 'SET_SHEET_STATE', payload: 'half' });
    await submit(val);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleSuggestion = (s) => {
    setText(s);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrapper}>
      {/* Parsed chips — show what was understood */}
      {parsedQueryChips.length > 0 && (
        <div className={styles.parsedChips}>
          {parsedQueryChips.map((chip, i) => (
            <span key={i} className={styles.parsedChip}>{chip}</span>
          ))}
        </div>
      )}

      {/* Suggestions — shown before first submit */}
      {!hasSubmitted && (
        <div className={styles.suggestions}>
          {QUERY_SUGGESTIONS.map((s, i) => (
            <button key={i} className={styles.suggestion} onClick={() => handleSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className={styles.barRow}>
        <input
          ref={inputRef}
          className={styles.input}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="3 BHK near Whitefield under 1.5 Cr..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button
          className={`${styles.sendBtn} ${!text.trim() ? styles.sendBtnDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!text.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

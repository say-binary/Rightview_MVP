import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BHK_OPTIONS, PROPERTY_TYPES, POSSESSION_OPTIONS, TRANSACTION_TYPES } from '../../utils/constants';
import { formatPrice } from '../../utils/priceFormatter';
import styles from './FilterBar.module.css';

function Checkmark({ active }) {
  return (
    <span className={`${styles.checkmark} ${active ? styles.checkmarkActive : ''}`}>
      {active && <svg viewBox="0 0 10 8" width="10" height="8" fill="none">
        <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>}
    </span>
  );
}

function Chevron({ open }) {
  return (
    <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 12 12" fill="none">
      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function BhkDropdown({ filters, dispatch, onClose }) {
  const selected = filters.bhk || [];
  const toggle = (n) => {
    const next = selected.includes(n) ? selected.filter(x => x !== n) : [...selected, n];
    dispatch({ type: 'SET_FILTERS', payload: { bhk: next } });
  };
  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownTitle}>Bedrooms</div>
      <div className={styles.pillGroup}>
        {BHK_OPTIONS.map(n => (
          <button key={n} onClick={() => toggle(n)}
            className={`${styles.pill} ${selected.includes(n) ? styles.pillActive : ''}`}>
            {n} BHK
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceDropdown({ filters, dispatch, onClose }) {
  const [min, setMin] = useState(filters.minPrice ? filters.minPrice / 100000 : '');
  const [max, setMax] = useState(filters.maxPrice ? filters.maxPrice / 100000 : '');

  const apply = () => {
    dispatch({ type: 'SET_FILTERS', payload: {
      minPrice: min ? parseFloat(min) * 100000 : null,
      maxPrice: max ? parseFloat(max) * 100000 : null,
    }});
    onClose();
  };

  const BRACKETS = [
    { label: 'Under 50L', min: null, max: 5000000 },
    { label: '50L–1Cr', min: 5000000, max: 10000000 },
    { label: '1–2Cr', min: 10000000, max: 20000000 },
    { label: '2–5Cr', min: 20000000, max: 50000000 },
    { label: 'Above 5Cr', min: 50000000, max: null },
  ];

  const selectBracket = (b) => {
    dispatch({ type: 'SET_FILTERS', payload: { minPrice: b.min, maxPrice: b.max } });
    onClose();
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownTitle}>Price Range</div>
      <div className={styles.pillGroup}>
        {BRACKETS.map(b => {
          const isActive = filters.minPrice === b.min && filters.maxPrice === b.max;
          return (
            <button key={b.label} onClick={() => selectBracket(b)}
              className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}>
              {b.label}
            </button>
          );
        })}
      </div>
      <div className={styles.divider} />
      <div className={styles.dropdownTitle}>Custom (in Lakhs)</div>
      <div className={styles.priceSection}>
        <div className={styles.priceRow}>
          <div style={{ flex: 1 }}>
            <div className={styles.priceLabel}>Min</div>
            <input className={styles.priceInput} type="number" placeholder="e.g. 50"
              value={min} onChange={e => setMin(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.priceLabel}>Max</div>
            <input className={styles.priceInput} type="number" placeholder="e.g. 150"
              value={max} onChange={e => setMax(e.target.value)} />
          </div>
        </div>
        <button className={styles.applyBtn} onClick={apply}>Apply</button>
      </div>
    </div>
  );
}

function ListDropdown({ title, options, selected, onToggle }) {
  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownTitle}>{title}</div>
      <div className={styles.optionList}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <div key={opt} className={`${styles.option} ${active ? styles.optionActive : ''}`}
              onClick={() => onToggle(opt)}>
              <Checkmark active={active} />
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar() {
  const { state, dispatch } = useApp();
  const { filters } = state;
  const [openChip, setOpenChip] = useState(null);
  const barRef = useRef(null);

  const toggle = (name) => setOpenChip(prev => prev === name ? null : name);
  const close = () => setOpenChip(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const hasActiveFilters =
    filters.bhk.length || filters.minPrice || filters.maxPrice ||
    filters.propertyType.length || filters.possession.length ||
    filters.transactionType || filters.locality;

  const toggleList = (key, val, list) => {
    const cur = filters[list] || [];
    const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
    dispatch({ type: 'SET_FILTERS', payload: { [list]: next } });
  };

  return (
    <div ref={barRef} className={styles.bar}>
      {hasActiveFilters && (
        <button className={styles.resetBtn}
          onClick={() => dispatch({ type: 'RESET_FILTERS' })}>
          ✕ Clear
        </button>
      )}

      {/* BHK */}
      <div className={styles.dropdownWrapper}>
        <button className={`${styles.chip} ${filters.bhk.length ? styles.chipActive : ''}`}
          onClick={() => toggle('bhk')}>
          {filters.bhk.length ? `${filters.bhk.sort().join(',')} BHK` : 'BHK'}
          {filters.bhk.length > 0 && <span className={styles.chipCount}>{filters.bhk.length}</span>}
          <Chevron open={openChip === 'bhk'} />
        </button>
        {openChip === 'bhk' && <BhkDropdown filters={filters} dispatch={dispatch} onClose={close} />}
      </div>

      {/* Price */}
      <div className={styles.dropdownWrapper}>
        <button className={`${styles.chip} ${(filters.minPrice || filters.maxPrice) ? styles.chipActive : ''}`}
          onClick={() => toggle('price')}>
          {filters.maxPrice
            ? `Up to ${formatPrice(filters.maxPrice)}`
            : filters.minPrice
            ? `From ${formatPrice(filters.minPrice)}`
            : 'Price'}
          <Chevron open={openChip === 'price'} />
        </button>
        {openChip === 'price' && <PriceDropdown filters={filters} dispatch={dispatch} onClose={close} />}
      </div>

      {/* Property Type */}
      <div className={styles.dropdownWrapper}>
        <button className={`${styles.chip} ${filters.propertyType.length ? styles.chipActive : ''}`}
          onClick={() => toggle('type')}>
          {filters.propertyType.length === 1 ? filters.propertyType[0] : 'Type'}
          {filters.propertyType.length > 0 && <span className={styles.chipCount}>{filters.propertyType.length}</span>}
          <Chevron open={openChip === 'type'} />
        </button>
        {openChip === 'type' && (
          <ListDropdown title="Property Type" options={PROPERTY_TYPES}
            selected={filters.propertyType}
            onToggle={(v) => toggleList('propertyType', v, 'propertyType')} />
        )}
      </div>

      {/* For Sale / Rent */}
      <div className={styles.dropdownWrapper}>
        <button className={`${styles.chip} ${filters.transactionType ? styles.chipActive : ''}`}
          onClick={() => toggle('tx')}>
          {filters.transactionType || 'For'}
          <Chevron open={openChip === 'tx'} />
        </button>
        {openChip === 'tx' && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownTitle}>Transaction</div>
            <div className={styles.pillGroup}>
              {TRANSACTION_TYPES.map(t => (
                <button key={t}
                  className={`${styles.pill} ${filters.transactionType === t ? styles.pillActive : ''}`}
                  onClick={() => {
                    dispatch({ type: 'SET_FILTERS', payload: {
                      transactionType: filters.transactionType === t ? null : t
                    }});
                    close();
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Possession */}
      <div className={styles.dropdownWrapper}>
        <button className={`${styles.chip} ${filters.possession.length ? styles.chipActive : ''}`}
          onClick={() => toggle('possession')}>
          {filters.possession.length === 1 ? filters.possession[0] : 'Status'}
          {filters.possession.length > 0 && <span className={styles.chipCount}>{filters.possession.length}</span>}
          <Chevron open={openChip === 'possession'} />
        </button>
        {openChip === 'possession' && (
          <ListDropdown title="Possession Status" options={POSSESSION_OPTIONS}
            selected={filters.possession}
            onToggle={(v) => toggleList('possession', v, 'possession')} />
        )}
      </div>
    </div>
  );
}

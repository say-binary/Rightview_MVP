import { useApp } from '../../context/AppContext';
import { useBottomSheet } from '../../hooks/useBottomSheet';
import PropertyCard from '../PropertyCard/PropertyCard';
import styles from './BottomSheet.module.css';

const sheetClass = {
  peek: styles.sheetPeek,
  half: styles.sheetHalf,
  full: styles.sheetFull,
};

export default function BottomSheet() {
  const { state } = useApp();
  const { properties, totalCount, isLoading } = state;
  const { sheetState, onDragStart, onDragEnd, setSheet } = useBottomSheet();

  const handleHandleClick = () => {
    if (sheetState === 'peek') setSheet('half');
    else if (sheetState === 'half') setSheet('full');
    else setSheet('peek');
  };

  return (
    <div className={`${styles.sheet} ${sheetClass[sheetState]}`}>
      {/* Drag handle */}
      <div
        className={styles.handle}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onClick={handleHandleClick}
      >
        <div className={styles.handleBar} />
      </div>

      {/* Peek state: just show count + tap to expand */}
      {sheetState === 'peek' ? (
        <div className={styles.peekRow} onClick={() => setSheet('half')} style={{ cursor: 'pointer' }}>
          <div className={styles.peekText}>
            {isLoading ? 'Searching...' : `${totalCount} properties found`}
          </div>
          <span className={styles.peekArrow}>View all ↑</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.count}>
              {totalCount}
              <span className={styles.countSub}>
                {totalCount === 1 ? ' property' : ' properties'}
              </span>
            </div>
            <button className={styles.expandBtn} onClick={() => setSheet(sheetState === 'full' ? 'half' : 'full')}>
              {sheetState === 'full' ? '↓ Collapse' : '↑ Expand'}
            </button>
          </div>

          {/* Content */}
          <div className={styles.list}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                Finding properties...
              </div>
            ) : properties.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No properties found</div>
                <div className={styles.emptySub}>Try adjusting your filters or moving the map</div>
              </div>
            ) : (
              properties.map(p => <PropertyCard key={p.id} property={p} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}

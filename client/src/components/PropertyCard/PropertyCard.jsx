import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/priceFormatter';
import styles from './PropertyCard.module.css';

function getPossessionBadge(status) {
  if (!status) return { label: null };
  const s = status.toLowerCase();
  if (s === 'ready to move') return { label: 'Ready to Move', cls: styles.badgeReady };
  if (s.includes('month') || s === '6 months') return { label: status, cls: styles.badgeSoon };
  if (s.includes('year') || s === '1 year' || s === '2 years') return { label: status, cls: styles.badgeSoon };
  if (s.includes('construction') || s.includes('launch')) return { label: status, cls: styles.badgeConstruction };
  return { label: status, cls: styles.badgeDefault };
}

export default function PropertyCard({ property }) {
  const { state, dispatch } = useApp();
  const isActive = state.activePropertyId === property.id;

  const handleClick = () => {
    dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: property.id });
    if (property.coordinates) {
      dispatch({
        type: 'SET_MAP_CENTER',
        payload: { lat: property.coordinates.latitude, lng: property.coordinates.longitude },
      });
    }
  };

  const img = property.images?.[0];
  const pd = property.property_details || {};
  const loc = property.location || {};
  const badge = getPossessionBadge(property.possession_status);

  const configParts = [pd.bhk_type, pd.property_type].filter(Boolean);
  const metaParts = [pd.area_sqft ? `${pd.area_sqft} sqft` : null, pd.furnishing_status].filter(Boolean);

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
      onClick={handleClick}
    >
      <div className={styles.imageWrap}>
        {img ? (
          <img
            src={img.url}
            alt={img.title || 'Property'}
            className={styles.image}
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={styles.imagePlaceholder} style={{ display: img ? 'none' : 'flex' }}>
          🏠
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <div className={styles.price}>{formatPrice(property.price?.value)}</div>
          {badge.label && (
            <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
          )}
        </div>

        {configParts.length > 0 && (
          <div className={styles.config}>{configParts.join(' · ')}</div>
        )}

        {metaParts.length > 0 && (
          <div className={styles.meta}>
            {metaParts.map((m, i) => (
              <span key={i}>
                {i > 0 && <span className={styles.dot}>·</span>}
                {m}
              </span>
            ))}
          </div>
        )}

        <div className={styles.location}>
          <svg className={styles.locationIcon} width="11" height="13" viewBox="0 0 11 13" fill="none">
            <path d="M5.5 0C2.46 0 0 2.46 0 5.5C0 9.625 5.5 13 5.5 13C5.5 13 11 9.625 11 5.5C11 2.46 8.54 0 5.5 0ZM5.5 7.5C4.395 7.5 3.5 6.605 3.5 5.5C3.5 4.395 4.395 3.5 5.5 3.5C6.605 3.5 7.5 4.395 7.5 5.5C7.5 6.605 6.605 7.5 5.5 7.5Z" fill="currentColor"/>
          </svg>
          {[loc.locality !== loc.city ? loc.locality : null, loc.city].filter(Boolean).join(', ')}
        </div>

        {property.price?.price_per_sqft > 0 && (
          <div className={styles.pricePerSqft}>
            ₹{property.price.price_per_sqft?.toLocaleString('en-IN')}/sqft
          </div>
        )}
      </div>
    </div>
  );
}

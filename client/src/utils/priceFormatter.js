/**
 * Formats a raw rupee value into a human-readable Indian format.
 * e.g. 8500000 → "₹85 Lac", 15000000 → "₹1.5 Cr", 500000 → "₹5 Lac"
 */
export function formatPrice(value) {
  if (!value && value !== 0) return '—';
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (value >= 100000) {
    const lac = value / 100000;
    return `₹${lac % 1 === 0 ? lac : lac.toFixed(1).replace(/\.?0+$/, '')} Lac`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Short pin label: "₹82L", "₹1.5Cr"
 */
export function formatPinLabel(value) {
  if (!value && value !== 0) return '—';
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${cr % 1 === 0 ? cr : parseFloat(cr.toFixed(1))}Cr`;
  }
  if (value >= 100000) {
    const lac = value / 100000;
    return `₹${lac % 1 === 0 ? lac : parseFloat(lac.toFixed(0))}L`;
  }
  return `₹${Math.round(value / 1000)}K`;
}

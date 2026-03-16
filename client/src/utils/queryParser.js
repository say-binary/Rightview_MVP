import { KNOWN_CITIES } from './constants';

/**
 * Parses a natural language property query into structured filter fields.
 * Pure function — no side effects, no async.
 *
 * @param {string} text
 * @returns {{ bhk, minPrice, maxPrice, locality, city, propertyType, possession, transactionType }}
 */
export function parseQuery(text) {
  if (!text || !text.trim()) return {};

  const t = text.trim();
  const result = {};

  // ── BHK ──────────────────────────────────────────────────────────
  const bhkMatch = t.match(/(\d+)\s*(?:bhk|bedroom)/i);
  if (bhkMatch) result.bhk = [parseInt(bhkMatch[1])];

  // ── PRICE ─────────────────────────────────────────────────────────
  // Range: "1 to 1.5 crore" or "1-1.5 cr"
  const rangeMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?|crore)/i);
  if (rangeMatch) {
    result.minPrice = Math.round(parseFloat(rangeMatch[1]) * 10_000_000);
    result.maxPrice = Math.round(parseFloat(rangeMatch[2]) * 10_000_000);
  } else {
    // Max in crore
    const underCrMatch = t.match(/(?:under|below|within|upto|up to)\s+(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?|crore)/i);
    if (underCrMatch) result.maxPrice = Math.round(parseFloat(underCrMatch[1]) * 10_000_000);

    // Max in lakh
    const underLacMatch = t.match(/(?:under|below|within|upto|up to)\s+(\d+(?:\.\d+)?)\s*(?:l(?:ac?h?|akh)?)/i);
    if (underLacMatch) result.maxPrice = Math.round(parseFloat(underLacMatch[1]) * 100_000);

    // Budget "X crore budget"
    const budgetMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?)\s+budget/i);
    if (budgetMatch && !result.maxPrice) result.maxPrice = Math.round(parseFloat(budgetMatch[1]) * 10_000_000);
  }

  // ── PROPERTY TYPE ─────────────────────────────────────────────────
  const typeMatch = t.match(/\b(apartment|flat|villa|penthouse|studio|builder\s+floor|independent\s+house)\b/i);
  if (typeMatch) {
    const raw = typeMatch[1].toLowerCase();
    if (raw === 'flat') result.propertyType = 'Apartment';
    else if (raw === 'studio') result.propertyType = 'Studio Apartment';
    else if (raw === 'builder floor' || raw === 'builder\u0020floor') result.propertyType = 'Builder Floor';
    else if (raw === 'independent house') result.propertyType = 'Independent House';
    else result.propertyType = raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // ── POSSESSION ────────────────────────────────────────────────────
  if (/ready\s+to\s+move/i.test(t)) result.possession = 'Ready to Move';
  else if (/under\s+construction/i.test(t)) result.possession = 'Under Construction';
  else if (/new\s+launch/i.test(t)) result.possession = 'New Launch';

  // ── TRANSACTION TYPE ──────────────────────────────────────────────
  if (/\bfor\s+rent\b|\bto\s+rent\b|\brental\b/i.test(t)) result.transactionType = 'Rent';
  else if (/\bfor\s+sale\b|\bto\s+buy\b|\bpurchase\b/i.test(t)) result.transactionType = 'Sale';

  // ── LOCATION: near / in ───────────────────────────────────────────
  // "near Whitefield" or "in Bandra"
  const nearMatch = t.match(/\bnear\s+([A-Za-z][A-Za-z0-9 ]+?)(?:\s+under|\s+below|\s+in\b|\s+for\b|$)/i);
  const inMatch = t.match(/\bin\s+([A-Za-z][A-Za-z0-9 ]+?)(?:\s+under|\s+below|\s+for\b|$)/i);

  const rawLoc = nearMatch ? nearMatch[1].trim() : inMatch ? inMatch[1].trim() : null;

  if (rawLoc) {
    // Check if it's a known city
    const matchedCity = KNOWN_CITIES.find(c => c.toLowerCase() === rawLoc.toLowerCase());
    if (matchedCity) {
      result.city = matchedCity;
    } else {
      result.locality = rawLoc;
    }
  }

  return result;
}

/**
 * Returns a human-readable summary of the parsed result for display as chips.
 * e.g. ["3 BHK", "Under ₹1.5Cr", "Whitefield"]
 */
export function summariseParsed(parsed) {
  const chips = [];
  if (parsed.bhk?.length) chips.push(`${parsed.bhk[0]} BHK`);
  if (parsed.maxPrice) {
    const val = parsed.maxPrice >= 10_000_000
      ? `₹${parsed.maxPrice / 10_000_000}Cr`
      : `₹${parsed.maxPrice / 100_000}L`;
    chips.push(`Under ${val}`);
  }
  if (parsed.locality) chips.push(parsed.locality);
  if (parsed.city) chips.push(parsed.city);
  if (parsed.propertyType) chips.push(parsed.propertyType);
  if (parsed.possession) chips.push(parsed.possession);
  if (parsed.transactionType) chips.push(parsed.transactionType);
  return chips;
}

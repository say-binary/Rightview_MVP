export const CITY_CENTERS = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
};

export const DEFAULT_CENTER = CITY_CENTERS.Bangalore;
export const DEFAULT_ZOOM = 12;

export const KNOWN_CITIES = Object.keys(CITY_CENTERS);

export const BHK_OPTIONS = [1, 2, 3, 4, 5];

export const PROPERTY_TYPES = [
  'Apartment',
  'Studio Apartment',
  'Villa',
  'Penthouse',
  'Builder Floor',
  'Independent House',
];

export const POSSESSION_OPTIONS = [
  'Ready to Move',
  '6 Months',
  '1 Year',
  '2 Years',
  'Under Construction',
  'New Launch',
];

export const PRICE_BRACKETS = [
  { label: 'Under ₹50L', min: 0, max: 5000000 },
  { label: '₹50L – ₹1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr – ₹2Cr', min: 10000000, max: 20000000 },
  { label: '₹2Cr – ₹5Cr', min: 20000000, max: 50000000 },
  { label: 'Above ₹5Cr', min: 50000000, max: null },
];

export const TRANSACTION_TYPES = ['Sale', 'Rent'];

export const QUERY_SUGGESTIONS = [
  '3 BHK near Whitefield under 1.5 Cr',
  'Ready to move apartments in Bangalore',
  '2 BHK flats under 80 lakh Pune',
  'Villas in Hyderabad for sale',
];

import authservice from 'pages/authentication/services/authservice';

/**
 * Translates between what the screens display and what the backend stores.
 *
 * The existing UI works in labels — "Seasonal Crops", "Autumn", "Total", "2026". The backend works
 * in codes, season ids and agricultural years. Rather than change either side, the difference is
 * resolved here: the screens keep their vocabulary and the API keeps its contract.
 */

/** Category card label → estimation type code. */
const ESTIMATION_TYPE_CODES = {
  'Seasonal Crops': 'SEASONAL_CROPS',
  'Annual & Perennial Crops': 'ANNUAL_PERENNIAL',
  'Land Utilization': 'LAND_UTILIZATION',
  'Irrigation Details': 'IRRIGATION',
  Irrigation: 'IRRIGATION'
};

/**
 * Season name → season id.
 *
 * Verified identical in the BTR and Form-1 masters during the backend work, so one mapping is
 * correct for both.
 */
const SEASON_IDS = {
  Autumn: 1,
  Winter: 2,
  Summer: 3
};

const SEASON_NAMES = { 1: 'Autumn', 2: 'Winter', 3: 'Summer' };

/** The land type control offers Total/Wet/Dry; the backend calls the combined figure ALL. */
const LAND_TYPES = {
  All: 'ALL',
  Total: 'ALL',
  Wet: 'WET',
  Dry: 'DRY',
  'Wet Land': 'WET',
  'Dry Land': 'DRY'
};

export const toEstimationTypeCode = (label) => ESTIMATION_TYPE_CODES[label] || 'LAND_UTILIZATION';

export const toSeasonId = (seasonName) => SEASON_IDS[seasonName];

export const toSeasonName = (seasonId) => SEASON_NAMES[seasonId] || null;

export const toLandType = (label) => LAND_TYPES[label] || 'ALL';

/** Whether the category is seasonal, which decides if a season applies at all. */
export const isSeasonal = (label) => toEstimationTypeCode(label) === 'SEASONAL_CROPS';

/**
 * The agricultural year, in the form the whole application already uses.
 *
 * This application has one canonical representation and it is not a bare year:
 * `AgriYearOptions.jsx` generates `${year}-${year + 1}`, stores it as `activeAgriYear`, and every
 * other EARAS screen passes it to the backend through `authservice.agriyear()`. The backend stores
 * exactly the same string. So a year needs no translation at all — it needs to be *taken from the
 * right place*.
 *
 * The bare "2026" the results screens hardcode is a leftover from their mock implementation and is
 * inconsistent with the rest of the application. Where one is still supplied it is read as the
 * **start** year, matching `generateAgriYears` and the selector's own "before July → previous agri
 * year" rule: the year running July 2026 to June 2027 is "2026-2027".
 *
 * Prefer {@link currentAgriYear}, which reads the user's actual selection.
 */
export const toAgriYear = (year) => {
  const value = String(year || '').trim();

  if (/^\d{4}-\d{4}$/.test(value)) {
    return value;
  }
  if (/^\d{4}$/.test(value)) {
    return `${value}-${Number(value) + 1}`;
  }
  return value;
};

/**
 * The agricultural year the user has selected in the header.
 *
 * The single source for every Area Estimation call, so the module cannot disagree with the rest of
 * the application about which year is being worked on.
 */
export const currentAgriYear = () => toAgriYear(authservice.agriyear());

/** The selection every estimation call is scoped by, built from the screen's current filters. */
export const toSelection = ({ estType, year, season, landType, districtId }) => ({
  estimationTypeCode: toEstimationTypeCode(estType),
  // The header's selection wins; an explicit year is only used when one is passed deliberately.
  agriYear: year ? toAgriYear(year) : currentAgriYear(),
  // A season is only meaningful for seasonal crops; the backend applies its own default otherwise.
  seasonId: isSeasonal(estType) ? toSeasonId(season) : undefined,
  landType: toLandType(landType),
  // "All" is the screens' way of saying state-wide, which the backend represents as no district.
  districtId: districtId && districtId !== 'All' ? Number(districtId) : undefined
});

/**
 * Formats a hectare figure for display.
 *
 * Presentation only — the value is already final. Nothing here rounds a published figure: the
 * decimals shown are the decimals stored, and a missing value stays visibly missing rather than
 * becoming a zero.
 */
export const formatHectares = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
};

/** A percentage the backend deliberately left null means "nothing to compare against". */
export const formatPercent = (value) => {
  if (value === null || value === undefined) {
    return '—';
  }
  const number = Number(value);
  return `${number > 0 ? '+' : ''}${number.toFixed(1)}%`;
};

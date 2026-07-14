const MAX_ENTRIES = 10;
const MAX_KEY_LENGTH = 100;
const MAX_VALUE_LENGTH = 255;

export function validateMetadataFilters(value) {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('metadataFilters must be a flat JSON object with string values');
  }

  const entries = Object.entries(value);
  if (entries.length > MAX_ENTRIES) {
    throw new Error(`metadataFilters must contain at most ${MAX_ENTRIES} entries`);
  }
  for (const [key, item] of entries) {
    if (key.length > MAX_KEY_LENGTH) {
      throw new Error(`metadataFilters keys must be at most ${MAX_KEY_LENGTH} characters`);
    }
    if (typeof item !== 'string') {
      throw new Error('metadataFilters must be a flat JSON object with string values');
    }
    if (item.length > MAX_VALUE_LENGTH) {
      throw new Error(`metadataFilters values must be at most ${MAX_VALUE_LENGTH} characters`);
    }
  }
  return value;
}

export function parseMetadataFiltersFlag(value) {
  if (value === undefined) return undefined;

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('--metadata-filters must be a flat JSON object with string values');
  }

  try {
    return validateMetadataFilters(parsed);
  } catch (error) {
    throw new Error(`--metadata-filters: ${error.message}`);
  }
}

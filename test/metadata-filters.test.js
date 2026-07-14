import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMetadataFiltersFlag } from '../src/metadata-filters.js';

test('metadata filters flag accepts a flat JSON object of string values', () => {
  assert.deepEqual(parseMetadataFiltersFlag('{"talivia_website_id":"website-1"}'), {
    talivia_website_id: 'website-1',
  });
  assert.equal(parseMetadataFiltersFlag(undefined), undefined);
});

test('metadata filters flag rejects arrays, nested objects, and non-string values', () => {
  for (const value of ['[]', '{"nested":{"id":"1"}}', '{"enabled":true}']) {
    assert.throws(() => parseMetadataFiltersFlag(value), /flat JSON object with string values/);
  }
});

test('metadata filters enforce backend entry, key, and value limits', () => {
  assert.throws(
    () => parseMetadataFiltersFlag(JSON.stringify(Object.fromEntries(Array.from({ length: 11 }, (_, index) => [`k${index}`, 'v'])))),
    /at most 10 entries/,
  );
  assert.throws(() => parseMetadataFiltersFlag(JSON.stringify({ ['k'.repeat(101)]: 'v' })), /keys must be at most 100/);
  assert.throws(() => parseMetadataFiltersFlag(JSON.stringify({ key: 'v'.repeat(256) })), /values must be at most 255/);
});

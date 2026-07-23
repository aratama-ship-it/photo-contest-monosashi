WITH channels AS (
  SELECT *
  FROM read_json_auto('data/discovery-channels.json')
  WHERE verifiedAt = '2026-07-23'
), evidence_cells AS (
  SELECT id, unnest([
    evidence.cadence,
    evidence.method,
    evidence.visibility,
    evidence.selection,
    evidence.rights,
    evidence.eligibility,
    evidence.freshness
  ]) AS evidence_state
  FROM channels
)
SELECT evidence_state, count(*) AS cell_count
FROM evidence_cells
GROUP BY evidence_state
ORDER BY cell_count DESC;

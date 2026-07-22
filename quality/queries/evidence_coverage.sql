WITH opportunities AS (
  SELECT *
  FROM read_json_auto('data/opportunities.json')
), evidence_cells AS (
  SELECT id, unnest([
    evidence.deadline,
    evidence.entrant,
    evidence.work,
    evidence.technical,
    evidence.publication,
    evidence.simultaneous,
    evidence.editing,
    evidence.rights
  ]) AS evidence_state
  FROM opportunities
)
SELECT evidence_state, count(*) AS cell_count
FROM evidence_cells
GROUP BY evidence_state
ORDER BY cell_count DESC;

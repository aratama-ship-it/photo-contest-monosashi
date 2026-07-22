SELECT
  sourceUrl AS official_url,
  sourceLabel AS source_label,
  count(*) AS route_count,
  string_agg(DISTINCT evidence.deadline, ', ') AS deadline_evidence,
  string_agg(DISTINCT evidence.technical, ', ') AS technical_evidence
FROM read_json_auto(['data/opportunities.json', 'data/worldwide-opportunities.json'])
GROUP BY sourceUrl, sourceLabel
ORDER BY route_count DESC, sourceLabel;

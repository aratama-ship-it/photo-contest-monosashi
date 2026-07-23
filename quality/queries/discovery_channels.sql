SELECT
  title AS channel,
  cadence,
  submissionLabel AS method,
  eligibilityLabel AS eligibility,
  outcome,
  warning AS recheck
FROM read_json_auto('data/discovery-channels.json')
WHERE verifiedAt = '2026-07-23'
ORDER BY title;

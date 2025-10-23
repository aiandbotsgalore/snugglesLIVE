CREATE OR REPLACE FUNCTION get_all_sessions()
RETURNS TABLE(session_id uuid, last_activity timestamptz, message_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.session_id,
    MAX(c.created_at) AS last_activity,
    COUNT(c.id) AS message_count
  FROM
    conversations AS c
  GROUP BY
    c.session_id
  ORDER BY
    last_activity DESC;
END;
$$ LANGUAGE plpgsql;

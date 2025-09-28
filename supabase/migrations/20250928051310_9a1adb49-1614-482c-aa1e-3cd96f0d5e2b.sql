-- Initialize business hours for existing businesses that don't have them
WITH business_days AS (
  SELECT 
    b.id as business_id,
    days.day_of_week,
    CASE 
      WHEN days.day_of_week = 0 THEN '08:00'::time  -- Sunday
      ELSE '08:00'::time
    END as start_time,
    CASE 
      WHEN days.day_of_week = 0 THEN '21:00'::time  -- Sunday  
      ELSE '21:00'::time
    END as end_time,
    CASE 
      WHEN days.day_of_week = 0 THEN true  -- Sunday closed
      ELSE false
    END as is_closed
  FROM businesses b
  CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5), (6)) AS days(day_of_week)
  WHERE b.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM business_hours bh 
      WHERE bh.business_id = b.id
    )
)
INSERT INTO business_hours (business_id, day_of_week, start_time, end_time, is_closed)
SELECT business_id, day_of_week, start_time, end_time, is_closed
FROM business_days;
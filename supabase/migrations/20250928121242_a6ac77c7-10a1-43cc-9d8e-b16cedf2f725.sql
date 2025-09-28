-- Clean up duplicate appointments for the 9:30 AM slot on 2025-09-29
-- Keep only the oldest appointment (71c46d72-1aaf-4da5-b99d-00c25d1f9140)

DELETE FROM appointments 
WHERE business_id = '4a6a6157-a250-4311-be88-ff1375107680' 
  AND appointment_date = '2025-09-29' 
  AND start_time = '09:30:00' 
  AND id IN (
    '73a95eac-0de1-4d38-b08e-de3834187bee',
    'cb33f78f-a37f-431c-b34f-a051af54f07a', 
    '777c3062-5538-41aa-8103-0dfe66405879',
    'b3b6b6a8-7b3d-442a-ac00-1e346a8c0311',
    'a9a7a719-83c7-4269-a7d1-abb1ddcddf62',
    '424a67ad-db4b-455f-916a-60e36b2b10a8'
  );
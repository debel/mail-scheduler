# OfficeRND Mail system design challange

## Overview of solution

## Worklog

### 27.08.2020
- Received and analyized the requirements.
- First impressions: big task, lots of code and system design work required
- Initial design thoughts:
-- Front-end and registration system seem easier
--- will record next "time-to-run" in mongo so that senders can fetch a list of upcomming messages
-- Senders will use distributed locks to ensure messages are sent only once
-- will build and test entire solution using docker-compose
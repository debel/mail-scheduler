# OfficeRND Mail system design challange

## Overview of solution

Run the entire solution using
`docker-compose up --build --force-recreate --remove-orphans --scale sender=3 sender`

## Worklog

### 27.08.2020
- Received and analyized the requirements.
- First impressions: big task, lots of code and system design work required
- Initial design thoughts:
-- Front-end and registration system seem easier
--- will record next "time-to-run" in mongo so that senders can fetch a list of upcomming messages
-- Senders will use distributed locks to ensure messages are sent only once
-- will build and test entire solution using docker-compose

### 30.08.2020

- Used ectd for distributed locking
- Fixed order of schedules each worker gets from MongoDB using a "last sent time" field

### 03.09.2020

- Developed front-end using React
-- Used context, but could have just used redux
- Will not style for now
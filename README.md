# Mail system design challange

## Running the solution

### Mailgun secrets
Copy the file `./mail-sender/config/secrets.template` as `secrets.js` in the same directory 
and substitute the dummy values with actual mailgun credentials.

### Run the entire solution
Execute the following command to execute the entire solution with 3 instances of the background `sender` process.
`docker-compose up --build --force-recreate --remove-orphans --scale sender=3`

Front-end should be available at: http://localhost:3000


Back-end should be available at: http://localhost:5000/schedules

## Overview of solution

The front-end and back-end for registering the mail schedules are very straightforward.
The front-end is a `react` application, created using `create-react-app`. It can be build and deployed as a static page.
The back-end is a Node.js application using `express`.

The core of the design is the `mail-sender` application. It can be scaled horizontally (running many instances in parallel) 
using `etcd` distributed locks to ensure that each e-mail is sent out only once.

You can control how many jobs each worker tries to pick up by modifying the `schedulesPerWorker` variable in the `./mail-sender/config/docker.js` config file.

I've not implemented the reporting functionality, but tracking the number of opened emails should be done using the mailgun webhooks api.

## Possible improvements
Many things can be improved
- Add styles to front-end
- Add data validation (both front-end and back-end)
- Add tests - unit, integration, e2e
- Delete expired schedules or move them to an "archive" collection
- Create indexes on the db
- Run etcd in a cluster

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

### 04.09.2020

- Integrated with mailgun
- Implemented schedule expiration

### 08.09.2020

- Added a redis based fence to prevent double sending when the distributed locks fail

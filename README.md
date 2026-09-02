🏥 Skitii Health

BLE Patient Monitoring Platform

A full-stack healthcare monitoring application built for real-time patient heart-rate monitoring through Bluetooth Low Energy (BLE).

Skitii Health enables healthcare staff to authenticate securely, manage patients, connect to a BLE heart-rate device directly from the browser, monitor real BPM readings in real time, conduct monitoring sessions, and review previously recorded sessions.

✨ Highlights

🔐 JWT-based staff authentication

👥 Complete patient management

🔵 Browser-based BLE device scanning and connection

❤️ Real-time heart-rate monitoring using actual BLE data

⏱️ Start, pause, resume, and end monitoring sessions

📊 Session summaries and historical records

📈 Average, minimum, and maximum heart rate

🧮 RMSSD calculation when RR interval data is available

🔌 BLE disconnect detection with preservation of collected readings

🗄️ MongoDB persistence through a NestJS backend

🛡️ Protected frontend routes and backend APIs

✅ Production builds verified successfully

🖥️ Application Overview

                         SKITII HEALTH
                    BLE Patient Monitoring
                              │
              ┌───────────────┴───────────────┐
              │                               │
        Healthcare Staff               BLE Heart Rate Device
              │                               │
              ▼                               │
      ┌─────────────────┐                     │
      │  Next.js Web App│◄──── Web Bluetooth ──┘
      └────────┬────────┘
               │
          REST API + JWT
               │
               ▼
      ┌─────────────────┐
      │  NestJS Backend │
      └────────┬────────┘
               │
            Mongoose
               │
               ▼
      ┌─────────────────┐
      │     MongoDB     │
      └─────────────────┘

Core Workflow

Staff Login
    ↓
Select Patient
    ↓
Scan for BLE Device
    ↓
Connect to Heart Rate Monitor
    ↓
Discover Heart Rate Service
    ↓
Subscribe to Heart Rate Measurements
    ↓
Receive Real BPM Data
    ↓
Start Monitoring Session
    ↓
Record Readings
    ↓
End Session
    ↓
Persist Session in MongoDB
    ↓
Review Session History

🚀 Features

🔐 Authentication

The application provides a secure staff authentication flow.

Staff registration

Email/password login

Password hashing with bcrypt

JWT access-token authentication

Protected frontend routes

Protected backend API endpoints

Logout

Login validation and useful error messages

Authentication flow:

Credentials
    ↓
POST /auth/login
    ↓
Credential Validation
    ↓
JWT Access Token
    ↓
Frontend Stores Token
    ↓
Bearer Token on Protected Requests
    ↓
NestJS JWT Guard
    ↓
Authorized Resource

👥 Patient Management

Healthcare staff can manage patient records from the application.

Supported operations:

Add patient

View patient details

Search patients

Edit patient information

Deactivate patient

Retrieve patient records from MongoDB

Patient data is stored persistently in MongoDB.

🔵 BLE Monitoring

The application uses the browser's Web Bluetooth API to communicate directly with compatible BLE heart-rate devices.

The BLE workflow includes:

Scan for nearby BLE devices

Select a device

Connect to the device

Discover available services

Discover characteristics

Subscribe to notifications

Parse incoming heart-rate packets

Display live BPM values

Store readings during the session

The implementation uses the standard Bluetooth Heart Rate Service.

Heart Rate Service
0000180d-0000-1000-8000-00805f9b34fb

Heart Rate Measurement
00002a37-0000-1000-8000-00805f9b34fb

The application receives actual BLE heart-rate measurements and does not generate random or simulated BPM values.

❤️ Live Monitoring Sessions

A monitoring session allows staff to observe physiological readings in real time.

During a session the application provides:

Current heart rate

Session timer

Number of readings

Start

Pause

Resume

End

BLE connection state

RR intervals when supplied by the device

RMSSD when sufficient RR interval data is available

Session summary calculations include:

Average Heart Rate
Minimum Heart Rate
Maximum Heart Rate
RMSSD / HRV when available

📊 Session History

Completed sessions can be reviewed from the Session History page.

Stored information includes:

Patient ID

Start time

End time

Duration

Heart-rate readings

RR intervals when available

Average heart rate

Minimum heart rate

Maximum heart rate

RMSSD when available

BLE device identifier

Session status

Each session also has a dedicated details view.

🔌 BLE Disconnect Handling

The application detects BLE disconnections during monitoring.

When a device disconnects:

The connection state is updated

Previously collected readings are preserved

The session data remains available

The session can be handled without discarding readings already received

This prevents measurements collected before a connection failure from being unnecessarily lost.

🛠️ Technology Stack

Layer

Technology

Frontend

Next.js 16

UI

React + Tailwind CSS

Language

TypeScript

BLE

Web Bluetooth API

Backend

NestJS

Database

MongoDB

ODM

Mongoose

Authentication

JWT

Password Security

bcrypt

API

REST

📁 Project Structure

skitii-ble-health/
│
├── README.md
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx
│   │       ├── dashboard/
│   │       ├── patients/
│   │       └── sessions/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── backend/
    ├── src/
    │   ├── auth/
    │   ├── patients/
    │   └── sessions/
    ├── test/
    ├── package.json
    └── README.md

⚙️ Prerequisites

Before running the project, install:

Node.js

npm

MongoDB

A browser supporting Web Bluetooth

Bluetooth hardware on the computer

A compatible BLE heart-rate device

Web Bluetooth requires a supported browser and available Bluetooth hardware.

🔑 Environment Configuration

Frontend

Create:

frontend/.env.local

Add:

NEXT_PUBLIC_API_URL=http://localhost:3001

Backend

Create:

backend/.env

Add:

MONGODB_URI=mongodb://127.0.0.1:27017/skitii_health
PORT=3001
JWT_SECRET=your-secret-key

Never commit real .env or .env.local files. The repository's .gitignore files exclude environment files from version control.

📦 Installation

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd skitii-ble-health

2. Install frontend dependencies

cd frontend
npm install

3. Install backend dependencies

Open another terminal:

cd backend
npm install

▶️ Running the Application

Start MongoDB

Make sure your local MongoDB server is running.

Start the Backend

From the backend directory:

npm run start:dev

Backend:

http://localhost:3001

Start the Frontend

From the frontend directory:

npm run dev

Frontend:

http://localhost:3000

Open the frontend in a supported browser.

🧭 Application Routes

Route

Description

/

Staff login

/signup

Staff registration

/dashboard

Main dashboard

/patients

Patient management

/sessions/new

New BLE monitoring session

/sessions

Session history

/sessions/[id]

Session details

🔗 API Reference

Authentication

Method

Endpoint

Description

POST

/auth/login

Authenticate staff and return JWT

Patients

Method

Endpoint

Description

GET

/patients

Get patients

POST

/patients

Create patient

GET

/patients/:id

Get patient

PATCH

/patients/:id

Update patient

DELETE

/patients/:id

Deactivate/delete patient

Sessions

Method

Endpoint

Description

POST

/sessions

Create/save session

GET

/sessions

Get sessions

GET

/sessions/:id

Get session details

Protected endpoints require a valid JWT Bearer token.

⌚ Tested BLE Device

The application has been tested with a Fire-Boltt BSW004.

The device exposes the standard Heart Rate Service and Heart Rate Measurement characteristic used by the application.

Important device behavior

The tested BSW004 requires heart-rate measurement to be activated manually from the watch before continuous measurements are transmitted.

The application then receives the real measurements through BLE notifications.

The application does not fabricate heart-rate values.

🧮 HRV / RMSSD

When the BLE device provides RR interval information within its heart-rate measurement packets, the application records the intervals and can calculate RMSSD.

If RR interval information is not supplied by the connected device:

HRV / RMSSD = Unavailable

This is why some sessions may show a blank or unavailable HRV value while heart-rate monitoring continues normally.

🛡️ Security

Security-related implementation includes:

bcrypt password hashing

JWT authentication

Bearer-token authorization

Protected NestJS routes

Protected frontend screens

Environment variables for secrets

.gitignore rules for environment files and generated dependencies

Real JWT secrets and database credentials are kept outside the repository.

⚠️ Current Limitations

BLE Device Compatibility

Web Bluetooth behavior depends on the capabilities and GATT implementation of the connected device.

The current implementation is designed around the standard Heart Rate Service and Heart Rate Measurement characteristic.

BSW004 Measurement Activation

The tested Fire-Boltt BSW004 requires heart-rate measurement to be started manually on the watch.

The browser application receives the data after the watch begins transmitting it.

RR / HRV Availability

RR interval data depends on what the BLE device provides. If RR intervals are not included, RMSSD cannot be calculated.

🧪 Verification

The following application workflows have been manually verified:

✅ Staff registration

✅ Staff login

✅ JWT authentication

✅ Protected frontend routes

✅ Protected backend APIs

✅ Patient creation

✅ Patient viewing

✅ Patient search

✅ Patient editing

✅ Patient deactivation

✅ BLE device scanning

✅ BLE device connection

✅ Heart Rate Service discovery

✅ Heart Rate Measurement notifications

✅ Real BPM readings

✅ Session start

✅ Session pause/resume

✅ Session timer

✅ Session completion

✅ Session persistence

✅ Session history

✅ Session details

✅ BLE disconnect detection

✅ Preservation of collected readings

✅ Frontend production build

✅ Backend production build

🏗️ Production Build

Frontend

cd frontend
npm run build

Backend

cd backend
npm run build

Both builds have been successfully verified during development.

🚀 Future Improvements

Potential improvements include:

Automatic BLE reconnection

Broader BLE device compatibility

Offline session synchronization

Improved local persistence

Pagination for large patient/session datasets

Automated unit and integration tests

Swagger API documentation

Docker support

Additional BLE device protocol support

Production deployment configuration

📸 Screenshots

Add application screenshots here before the final submission.

Suggested screenshots:

Login

Dashboard

Patient Management

BLE Device Connection

Live Heart Rate Session

Session History

Session Details

Example:

screenshots/
├── login.png
├── dashboard.png
├── patients.png
├── ble-session.png
├── session-history.png
└── session-details.png

👨‍💻 Project

Skitii Health — BLE Patient Monitoring Platform

Developed as part of the Skitii Full Stack Developer Internship hiring task.

The project demonstrates full-stack development, REST API integration, JWT authentication, MongoDB persistence, browser-based BLE communication, real-time physiological monitoring, and session management.

# Skitii Health - BLE Patient Monitoring Platform

A full-stack healthcare monitoring application that allows healthcare staff to manage patients, connect to a Bluetooth Low Energy heart-rate device, monitor real-time heart-rate data, and save completed monitoring sessions for later review.

## Features

### Authentication
- Staff login using email and password
- JWT-based authentication
- Protected application routes and backend APIs
- Logout functionality
- Login validation and error handling
- Staff registration

### Patient Management
- Add, view, search, and edit patients
- Deactivate patients
- Store patient information in MongoDB

### BLE Heart Rate Monitoring
- Scan for nearby BLE devices using the browser Web Bluetooth API
- Select and connect to a BLE heart-rate device
- Discover BLE services and characteristics
- Subscribe to Heart Rate Measurement notifications
- Parse real heart-rate measurements
- Display live BPM values
- Show BLE connection status
- Detect BLE disconnection
- Preserve readings collected before disconnection

### Monitoring Sessions
- Select a patient before starting a session
- Start, pause, resume, and end sessions
- Display a session timer
- Record heart-rate readings
- Calculate average, minimum, and maximum heart rate
- Calculate RMSSD when RR interval data is available
- Save completed sessions

### Session History
- View previous monitoring sessions
- View duration, average HR, HR range, readings, BLE device, and status
- View detailed session information

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Web Bluetooth API

### Backend
- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

## Project Structure

```text
skitii-ble-health/
├── backend/
│   ├── src/
│   └── README.md
├── frontend/
│   ├── src/
│   └── README.md
└── README.md
```

## Application Architecture

```text
Web Browser / Next.js
        │
        │ REST API + JWT
        ▼
NestJS Backend
        │
        │ Mongoose
        ▼
MongoDB

BLE Heart Rate Device
        │
        │ Web Bluetooth
        ▼
Next.js Browser
```

## BLE Data Flow

```text
BLE Device
    ↓
Device Scan
    ↓
Device Selection
    ↓
BLE Connection
    ↓
Service Discovery
    ↓
Heart Rate Measurement Characteristic
    ↓
Notifications
    ↓
Heart Rate Packet Parsing
    ↓
Live BPM Display
    ↓
Session Readings
    ↓
MongoDB
```

The application uses the standard Bluetooth Heart Rate Service:

```text
Service:
0000180d-0000-1000-8000-00805f9b34fb

Characteristic:
00002a37-0000-1000-8000-00805f9b34fb
```

## BLE Device Setup

For the tested Fire-Boltt BSW004:

1. Turn on Bluetooth on the computer.
2. Turn on the smartwatch.
3. Open the New Session page.
4. Select a patient.
5. Start the BLE connection.
6. Select the smartwatch in the browser Bluetooth chooser.
7. Allow the browser to connect.
8. Start heart-rate measurement from the watch.
9. Start the monitoring session in the application.

The tested BSW004 requires heart-rate measurement to be activated manually from the watch before measurements are continuously received by the application.

## Prerequisites

- Node.js
- npm
- MongoDB
- A browser with Web Bluetooth support
- BLE heart-rate device

## Environment Variables

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend

Create `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/skitii_health
PORT=3001
JWT_SECRET=your-secret-key
```

Do not commit real environment files or secrets to GitHub.

## Installation

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

## Running the Application

Make sure MongoDB is running locally.

### Backend

From `backend`:

```bash
npm run start:dev
```

Backend:

```text
http://localhost:3001
```

### Frontend

From `frontend`:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Main Application Routes

| Route | Purpose |
|---|---|
| `/` | Staff login |
| `/signup` | Staff registration |
| `/dashboard` | Main dashboard |
| `/patients` | Patient management |
| `/sessions/new` | Start a BLE monitoring session |
| `/sessions` | Session history |
| `/sessions/[id]` | Session details |

## API Endpoints

### Authentication

```text
POST /auth/login
```

### Patients

```text
GET    /patients
POST   /patients
GET    /patients/:id
PATCH  /patients/:id
DELETE /patients/:id
```

Patient APIs require JWT authentication.

### Sessions

```text
POST /sessions
GET    /sessions
GET    /sessions/:id
```

Session APIs require JWT authentication.

## Authentication Flow

```text
Staff Login
    ↓
POST /auth/login
    ↓
Credential validation
    ↓
JWT access token generated
    ↓
Token stored by frontend
    ↓
Token sent with protected API requests
    ↓
NestJS JWT Guard validates token
    ↓
Protected resource returned
```

## Session Data

A monitoring session stores:

- Patient ID
- Session start time
- Session end time
- Duration
- BLE device identifier
- Session status
- Heart-rate readings
- RR intervals when available
- Average heart rate
- Minimum heart rate
- Maximum heart rate
- RMSSD when RR interval data is available

## BLE Disconnect Handling

If the BLE device disconnects during a monitoring session, the application detects the disconnection and preserves readings already collected during the session.

## Heart Rate and HRV

Heart rate is received directly from the BLE Heart Rate Measurement characteristic.

When RR interval data is available in received BLE packets, the application can use those intervals to calculate RMSSD. If RR interval data is not provided by the device, HRV/RMSSD is shown as unavailable.

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

Both frontend and backend have been verified with successful production builds.

## Security

- Passwords are hashed using bcrypt.
- Authentication uses JWT access tokens.
- Protected backend endpoints require a valid Bearer token.
- Protected frontend pages require authentication.
- Environment files containing secrets should not be committed to the repository.

## Current BLE Limitation

The tested Fire-Boltt BSW004 provides the standard Heart Rate Service and Heart Rate Measurement characteristic for receiving heart-rate data.

The device requires heart-rate measurement to be started manually from the watch. The application receives and processes the actual BLE measurements after the watch begins transmitting them.

The application does not generate random or simulated heart-rate values.

## Error Handling

The application handles common errors including:

- Invalid login credentials
- Missing login fields
- Backend connection failures
- Unauthorized API requests
- BLE connection failures
- BLE disconnections
- Missing BLE characteristics
- Session save failures

## Future Improvements

- Automatic BLE reconnection
- More extensive device compatibility
- Offline session synchronization
- Pagination for large patient and session datasets
- Automated testing
- API documentation with Swagger
- Docker-based deployment
- Additional BLE device protocol support

## Author

Developed as part of the Skitii Full Stack Developer Internship hiring task.

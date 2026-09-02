# 🏥 **Skitii Health** ❤️

### **BLE Patient Monitoring Platform**

A full-stack healthcare monitoring platform that enables healthcare staff to manage patients, connect to a **Bluetooth Low Energy (BLE) heart-rate device**, monitor real-time physiological data, and review completed monitoring sessions.

Built with **Next.js, React, TypeScript, NestJS, MongoDB, JWT authentication, and Web Bluetooth API**.

---

## 🚀 **Features**

### 🔐 Secure Authentication
- Staff registration and login
- JWT-based authentication
- Protected frontend routes
- Protected backend APIs
- Password hashing with bcrypt
- Logout and validation/error handling

### 👥 Patient Management
- Add patients
- View patient details
- Search patients
- Edit patient information
- Deactivate patients
- Persistent MongoDB storage

### 🔵 BLE Heart Rate Monitoring
- Scan for nearby BLE devices
- Select and connect to a BLE device
- Discover BLE services and characteristics
- Subscribe to heart-rate notifications
- Parse real BLE heart-rate packets
- Display live BPM readings
- Track BLE connection status
- Detect device disconnection
- Preserve readings collected before disconnection

### ❤️ Monitoring Sessions
- Select a patient
- Start a monitoring session
- Pause and resume a session
- Live session timer
- Record heart-rate readings
- Calculate average, minimum, and maximum HR
- Record RR intervals when available
- Calculate RMSSD when RR interval data is available
- End and save sessions

### 📊 Session History
- View completed sessions
- View session duration
- View average heart rate
- View minimum and maximum heart rate
- View number of readings
- View BLE device identifier
- View session status
- Open detailed session information

---

## 🛠️ **Tech Stack**

| Category | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS |
| BLE | Web Bluetooth API |
| Backend | NestJS |
| Database | MongoDB |
| Database ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| API | REST |

---

## 🏗️ **Architecture**

```text
                    ┌─────────────────────┐
                    │   Healthcare Staff  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Next.js Frontend   │
                    │                     │
                    │ Login / Patients    │
                    │ BLE / Sessions      │
                    └──────────┬──────────┘
                               │
                       REST API + JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   NestJS Backend    │
                    │                     │
                    │ Auth / Patients     │
                    │ Sessions            │
                    └──────────┬──────────┘
                               │
                            Mongoose
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MongoDB       │
                    │                     │
                    │ Users / Patients    │
                    │ Monitoring Sessions │
                    └─────────────────────┘

          BLE Heart Rate Device
                    │
              Web Bluetooth API
                    │
                    ▼
              Next.js Browser
```

---

## 🔵 **How BLE Monitoring Works**

The application communicates with the BLE heart-rate device directly through the browser.

```text
Scan Device
     ↓
Select Device
     ↓
Connect
     ↓
Discover Services
     ↓
Find Heart Rate Characteristic
     ↓
Subscribe to Notifications
     ↓
Receive BLE Packets
     ↓
Parse Heart Rate
     ↓
Display Live BPM
     ↓
Store Session Readings
```

The application uses the standard Bluetooth Heart Rate Service:

```text
Heart Rate Service
0000180d-0000-1000-8000-00805f9b34fb

Heart Rate Measurement
00002a37-0000-1000-8000-00805f9b34fb
```

The application receives **actual measurements from the BLE device** and does not generate random or simulated heart-rate values.

---

## ❤️ **Live Monitoring**

During an active session, the healthcare staff can monitor:

```text
┌─────────────────────────────────┐
│         LIVE MONITORING         │
├─────────────────────────────────┤
│                                 │
│       Heart Rate: 84 BPM        │
│                                 │
│       Session: 01:33            │
│       Readings: 35              │
│                                 │
│       ● BLE Connected           │
│                                 │
│       [ Pause ]   [ End ]       │
│                                 │
└─────────────────────────────────┘
```

Session summaries include:

- Average heart rate
- Minimum heart rate
- Maximum heart rate
- Total readings
- Duration
- RMSSD when RR intervals are available

---

## 👥 **Patient Management**

The patient management module allows staff to maintain patient records before starting monitoring sessions.

```text
Add Patient
    ↓
Store in MongoDB
    ↓
Search / View / Edit
    ↓
Select Patient
    ↓
Start Monitoring Session
```

Patients can also be deactivated while preserving their historical session information.

---

## 📊 **Session History**

Every completed monitoring session can be reviewed later.

Stored session information includes:

- Patient ID
- Start time
- End time
- Duration
- Heart-rate readings
- RR intervals when available
- Average heart rate
- Minimum heart rate
- Maximum heart rate
- RMSSD when available
- BLE device identifier
- Session status

---

## 🔌 **BLE Disconnect Handling**

The application detects when the BLE connection is interrupted.

Previously received readings are preserved so that measurements collected before the disconnect are not unnecessarily lost.

```text
Connected
    ↓
BLE Disconnect
    ↓
Connection State Updated
    ↓
Existing Readings Preserved
    ↓
Session Data Remains Available
```

---

## ⌚ **Tested BLE Device**

The application has been tested with:

### **Fire-Boltt BSW004**

The tested device exposes:

```text
Heart Rate Service (180D)
        ↓
Heart Rate Measurement (2A37)
        ↓
Notifications
        ↓
Real BPM Readings
```

### Important Device Behavior

The BSW004 requires heart-rate measurement to be **started manually from the watch** before continuous measurements are transmitted.

Once measurement is active, the application receives the actual BPM values through BLE notifications.

---

## 🧮 **Heart Rate & HRV**

Heart rate is received directly from the standard BLE Heart Rate Measurement characteristic.

When RR interval information is included in the BLE packets:

```text
RR Intervals
     ↓
RMSSD Calculation
     ↓
HRV Result
```

If the connected device does not provide RR interval data, HRV/RMSSD is displayed as unavailable.

---

## ⚙️ **Installation**

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd skitii-ble-health
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

---

## 🔑 **Environment Variables**

### Frontend

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend

Create:

```text
backend/.env
```

Add:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/skitii_health
PORT=3001
JWT_SECRET=your-secret-key
```

> ⚠️ Never commit real `.env` or `.env.local` files. Environment files are excluded using `.gitignore`.

---

## ▶️ **Getting Started**

### Start MongoDB

Make sure MongoDB is running locally.

### Start Backend

```bash
cd backend
npm run start:dev
```

Backend:

```text
http://localhost:3001
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Open the frontend in a supported browser.

---

## 🧭 **Application Routes**

| Route | Purpose |
|---|---|
| `/` | Staff Login |
| `/signup` | Staff Registration |
| `/dashboard` | Dashboard |
| `/patients` | Patient Management |
| `/sessions/new` | New BLE Session |
| `/sessions` | Session History |
| `/sessions/[id]` | Session Details |

---

## 🔗 **API Reference**

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Authenticate staff |

### Patients

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/patients` | Get patients |
| `POST` | `/patients` | Create patient |
| `GET` | `/patients/:id` | Get patient |
| `PATCH` | `/patients/:id` | Update patient |
| `DELETE` | `/patients/:id` | Deactivate/delete patient |

### Sessions

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/sessions` | Create/save session |
| `GET` | `/sessions` | Get sessions |
| `GET` | `/sessions/:id` | Get session details |

Protected endpoints require JWT Bearer authentication.

---

## 🛡️ **Security**

- Passwords are hashed using bcrypt.
- JWT access tokens protect authenticated resources.
- Protected backend routes require valid Bearer tokens.
- Protected frontend pages require authentication.
- Environment files are excluded from Git.
- Database and JWT secrets are kept outside the repository.

---

## 📸 **Screenshots**

Add screenshots of the application here before final submission.

Recommended screenshots:

### 🔐 Login

```text
screenshots/login.png
```

### 👥 Patient Management

```text
screenshots/patients.png
```

### 🔵 BLE Connection

```text
screenshots/ble-connection.png
```

### ❤️ Live Monitoring

```text
screenshots/live-session.png
```

### 📊 Session History

```text
screenshots/session-history.png
```

### 📋 Session Details

```text
screenshots/session-details.png
```

---

## 🧪 **Testing & Verification**

The following workflows have been manually verified:

- ✅ Registration
- ✅ Login
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Patient creation
- ✅ Patient viewing
- ✅ Patient search
- ✅ Patient editing
- ✅ Patient deactivation
- ✅ BLE scanning
- ✅ BLE connection
- ✅ BLE service discovery
- ✅ Heart-rate characteristic discovery
- ✅ BLE notifications
- ✅ Real BPM readings
- ✅ Session start
- ✅ Session pause/resume
- ✅ Session timer
- ✅ Session completion
- ✅ Session persistence
- ✅ Session history
- ✅ Session details
- ✅ BLE disconnect handling
- ✅ Existing readings preserved
- ✅ Frontend production build
- ✅ Backend production build

---

## 📈 **Build Verification**

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

Both frontend and backend production builds have been successfully verified.

---

## ⚠️ **Known Limitations**

### BLE Device Compatibility

Web Bluetooth depends on browser support and the GATT implementation of the connected device.

The current implementation focuses on the standard Heart Rate Service and Heart Rate Measurement characteristic.

### BSW004 Measurement Activation

The tested Fire-Boltt BSW004 requires heart-rate measurement to be manually started from the watch.

### RR Interval Availability

RR intervals depend on the data provided by the connected BLE device. If RR intervals are unavailable, RMSSD cannot be calculated.

---

## 🚀 **Future Improvements**

- Automatic BLE reconnection
- Broader BLE device compatibility
- Offline session synchronization
- Improved local persistence
- Pagination for large datasets
- Automated unit and integration tests
- Swagger API documentation
- Docker support
- Production deployment
- Additional BLE device protocol support

---

## 🤝 **Contributing**

Contributions and suggestions are welcome.

If you would like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the application
5. Submit a pull request

---

## 📄 **License**

This project was developed as part of the **Skitii Full Stack Developer Internship hiring task**.

---

## 👨‍💻 **Project**

### **Skitii Health — BLE Patient Monitoring Platform**

Built to demonstrate practical full-stack development with:

**Next.js • React • TypeScript • NestJS • MongoDB • JWT • Web Bluetooth API**

⭐ If you find this project useful, consider giving the repository a star.

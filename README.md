
# Elevator Access Management App

A mobile + web application for controlled elevator access in residential buildings.

Residents can access the elevator using a temporary access code linked to their account. The code updates automatically, and users can also view their profile details and payment status.

The project was independently designed and developed based on requirements from an early-stage startup concept.

> **Try it online**  
> You can run the app directly in your browser (no Expo Go or mobile device required).

---

## Overview

The application acts as the client for an elevator access-management system.

Each authorized resident has an account associated with their building. After logging in, the app displays the current access code assigned to the user.

Originally the access code was designed to change very frequently (like a one-time code). It was later changed to a **daily code** to reduce unnecessary backend requests and scheduled jobs while still providing regularly rotating credentials.

The latest valid code is also stored locally, so it remains available during temporary loss of internet connection.

---

## Main Features

### Authentication
- User registration and login
- Persistent sign-in state
- Separate navigation flows for regular users and administrators
- Splash screen with authentication-state checking

### Elevator Access Code
- Displays the user's current elevator access code
- Access codes are regenerated on a daily schedule
- Latest retrieved code is stored locally for offline availability

### User Profile
- Personal user information
- Profile image support
- Payment-status information

### Administration
- Dedicated administrator interface
- Separate admin navigation flow

### Offline Support
When the app successfully fetches the current code while online, it stores it locally.  
If the device later loses connectivity, the stored code remains usable until the next required update.

---

## Architecture

```text
┌─────────────────────────────┐
│   React Native + Expo App   │
│                             │
│  Authentication             │
│  Elevator Access Code       │
│  User Profile               │
│  Payment Status             │
│  Admin Interface            │
│  Local Storage              │
└──────────────┬──────────────┘
               │
               │ API Requests
               ▼
┌─────────────────────────────┐
│       Cloudflare API        │
│                             │
│     Cloudflare Workers      │
│     Server-side Logic       │
│     Code Generation         │
│     Scheduled Tasks         │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ Cloudflare D1│  │ Cloudflare R2│
│              │  │              │
│ User data    │  │ Profile      │
│ Profiles     │  │ images       │
│ Payment data │  │              │
└──────────────┘  └──────────────┘
```

---

## Technology Stack

**Frontend**
- React Native
- Expo
- React Navigation
- AsyncStorage
- NetInfo
- Expo Image Picker
- i18n-js

**Backend & Cloud**
- Cloudflare Workers
- Cloudflare D1 (SQL database)
- Cloudflare R2 (object storage)
- Scheduled Workers (cron)

**Other**
- Firebase
- Git / GitHub

---

## Design Decisions

### Daily Access Codes
The initial concept used rapidly changing codes. During development the frequency was reduced to once per day for these reasons:

- Fewer backend requests
- Lower load on scheduled workers
- Reduced network dependency
- Lower infrastructure cost
- Simpler user experience

The daily reset time can be shifted away from midnight to avoid inconvenient code changes when residents are returning home.

### Local Code Persistence
The latest valid code is stored on the device after being fetched.  
This provides a graceful fallback when the user temporarily loses internet connectivity.

---

## Project Structure

```text
src/
├── components/
├── i18n/
└── screens/
    ├── auth/
    │   ├── LogInPage
    │   ├── SignUpPage
    │   └── SuccessPage
    │
    └── main/
        ├── MainActivity
        ├── AdminPage
        └── ProfilePage
```

---

## Getting Started

### Prerequisites
- Node.js 18 or newer
- npm (or yarn / pnpm)

### Installation

```bash
git clone https://github.com/RagindaBijo/Elevator-App.git
cd Elevator-App
npm install
```

### Running the App


#### Option 1 – Web (easiest, no extra apps needed)
```bash
npx expo start --web
```
The app will open in your browser at `http://localhost:8081`.

#### Option 2 – Mobile with Expo Go
1. Install the free **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Run:
   ```bash
   npx expo start
   ```
3. Scan the QR code with Expo Go

#### Option 3 – Native builds (optional)
```bash
npx expo run:android
# or
npx expo run:ios
```

### Test Account (for demo purposes)

You can use the following credentials to log in and explore the app:

- **Email:** `admin@test.com`  
- **Password:** `admin`

> Note: This is a demo account created for testing. Do not use real credentials.

---

## Project Status

This is a complete working prototype of the elevator-access workflow.

It was built independently based on requirements from an early-stage startup and was intended for potential commercial use. The project was ultimately not commercialized.

---

## What I Learned

- Turning a real business requirement into a working mobile + web application
- React Native & Expo development (including web support)
- Authentication flows and role-based navigation
- Designing for intermittent connectivity
- Building a serverless backend with Cloudflare Workers, D1 and R2
- Balancing security, cost and user experience
- Local data persistence strategies

---

## Author

**Luka Ivaniadze**  
GitHub: [https://github.com/RagindaBijo](https://github.com/RagindaBijo)
```

# Elevator Access Management App

A mobile application concept designed for controlled elevator access in residential buildings.

The application was developed around a simple idea: residents should be able to access the elevator using a temporary access code that is associated with their account and updated automatically. The system also provides residents with account information such as their profile details and payment status.

The project was independently designed and developed based on requirements provided by an early-stage startup concept.

## Overview

The application acts as the mobile client for an elevator access-management system.

Each authorized resident has an account associated with their building and elevator access. After authentication, the application displays the current access code assigned to the user.

The access code was originally designed to change very frequently, similar to a one-time authentication code. The design was later changed to a daily code to reduce unnecessary requests to the backend and scheduled services while still providing regularly changing access credentials.

The application also supports local persistence of the latest valid code. This means that after the application retrieves the current code while the device has an internet connection, the code can remain available locally during temporary connectivity loss.

## Main Features

### Authentication

* User registration and login
* Persistent sign-in state
* Separate navigation flows for regular users and administrators
* Splash screen with authentication-state checking

### Elevator Access Code

* Displays the user's current elevator access code
* Access codes are periodically regenerated
* Daily access-code model designed to reduce unnecessary backend requests
* Latest retrieved code can be stored locally for temporary offline availability

### User Profile

* Personal user information
* Profile image support
* Payment-status information
* Account-related data

### Administration

* Dedicated administrator interface
* Separate admin navigation flow
* Designed to support management of users and access-related information

### Offline Considerations

The application was designed with intermittent connectivity in mind.

When a user opens the application with an internet connection, the current access code can be retrieved and stored locally. If connectivity is subsequently unavailable, the locally stored code remains available until the next required update.

This approach reduces unnecessary network requests while maintaining usability in situations where the user temporarily has no connection.

## Architecture

The project consists of a mobile client and cloud-based backend services.

```text
┌─────────────────────────────┐
│      React Native App       │
│                             │
│  Authentication             │
│  Elevator Access Code       │
│  User Profile               │
│  Payment Status              │
│  Admin Interface             │
│  Local Storage               │
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

## Technology Stack

### Mobile

* React Native
* Expo
* JavaScript
* React Navigation
* AsyncStorage
* NetInfo
* Expo Image Picker

### Backend & Cloud

* Node.js
* Cloudflare Workers
* Cloudflare D1
* Cloudflare R2
* Scheduled Workers

### Additional Technologies

* Firebase
* i18n-js
* Git
* GitHub

## Design Decisions

### Daily Access Codes

The initial concept used rapidly changing codes. During development, the update frequency was changed to once per day.

The main reasons were:

* Reduce backend requests
* Reduce unnecessary scheduled-worker executions
* Reduce network dependency
* Reduce infrastructure and egress overhead
* Keep the user experience simple

The daily code does not necessarily reset exactly at midnight. The update time can be shifted to avoid inconvenient changes around the time residents may be returning home.

### Local Code Persistence

The latest valid code is stored locally after being retrieved from the backend.

This provides a fallback when a user temporarily loses internet connectivity after opening the application and retrieving the current code.

## Project Structure

The application uses a screen-based React Native structure with separate areas for authentication and main application functionality.

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

The application entry point configures the navigation container and controls the initial authentication flow.

## Getting Started

### Prerequisites

* Node.js
* npm
* Expo CLI / Expo development environment
* Android Studio or Xcode for native development, depending on the target platform

### Installation

Clone the repository:

```bash
git clone https://github.com/RagindaBijo/Elevator-App.git
```

Navigate into the project:

```bash
cd Elevator-App
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

You can also start the project directly for a specific platform:

```bash
npm run android
```

```bash
npm run ios
```

```bash
npm run web
```

These scripts are defined in the project's `package.json`.

## Project Status

The mobile application has been developed as a complete prototype around the proposed elevator-access workflow.

The project was created independently and was intended for potential use by an early-stage elevator-access startup. The application was developed based on the business requirements provided by the startup, but the project was ultimately not commercialized.

## What I Learned

This project provided hands-on experience with:

* Designing a mobile application from a real-world business requirement
* React Native and Expo development
* Mobile navigation and authentication flows
* API-driven application architecture
* Cloudflare serverless services
* Database design and user data management
* Scheduled backend logic
* Local data persistence
* Designing for intermittent network connectivity
* Balancing security, infrastructure usage, and user experience

## Author

**Luka Ivaniadze**

GitHub: https://github.com/RagindaBijo

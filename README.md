# RutaFacil - Smart Ride Management

RutaFacil is an Angular-based ride booking platform connecting **drivers** and **passengers** seamlessly via **WhatsApp**. It simplifies scheduling, booking, and notifications for the Chihuahua → Juárez route, with future scalability for multiple routes and users.

---

## Table of Contents
- [Features](#features)
- [Users & Roles](#users--roles)
- [Pages / Views](#pages--views)
- [User Interaction Flow](#user-interaction-flow)
- [Angular Architecture](#angular-architecture)
- [Backend & API](#backend--api)
- [WhatsApp Integration](#whatsapp-integration)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Future Enhancements](#future-enhancements)

---

## Features

### Passenger
- Book rides via WhatsApp without installing an app
- Provide date, time, pickup, and destination
- Receive instant booking confirmation with driver info
- Real-time notifications (WhatsApp & dashboard)

### Driver
- Create schedules and manage available trips
- Receive instant bookings via WhatsApp
- Track seat availability and manage dashboard
- Automatic notifications for bookings and cancellations

### Shared / System
- WhatsApp integration service
- Real-time updates
- Scalable backend API with Node.js / LoopBack 4
- Dashboard navigation with Angular Router and lazy-loaded modules

---

## Users & Roles

| Role       | Description |
|-----------|-------------|
| Passenger | Book rides and receive confirmations |
| Driver    | Manage schedules, receive bookings, and track trips |

---

## Pages / Views

| Page / Component              | Purpose |
|-------------------------------|---------|
| Home (Landing)                | Hero section, app description, CTA buttons |
| Customer Booking              | Step-by-step booking instructions, WhatsApp trigger |
| Driver Dashboard              | Schedule creation, bookings list, notifications |
| How It Works                  | Step-by-step explanation for customers and drivers |
| Navbar / Shared Header        | Navigation links, reused across modules |
| Footer / Shared               | Company info, contact, privacy, help links |
| Services (Angular)            | `BookingService`, `WhatsappService` for API/WhatsApp logic |

---

## User Interaction Flow

### Passenger
1. Click **Reservar un Viaje** on Home
2. Follow step-by-step instructions on Customer Booking
3. Trigger WhatsApp chat via Angular service
4. Receive booking confirmation with driver details

### Driver
1. Click **Comenzar como Conductor** on Home
2. Fill schedule form on Driver Dashboard
3. Submit → Angular service stores schedule via API
4. View bookings and notifications in dashboard

---

## Angular Architecture

- **Modules**
  - `AppModule` → root
  - `PagesModule` → Home, Customer, Driver, HowItWorks
  - `SharedModule` → Navbar, Footer, reusable components
  - `CoreModule` → Services: `BookingService`, `WhatsappService`

- **Routing**
  ```ts
  '/' → Home
  '/customer' → CustomerBooking
  '/driver' → DriverDashboard
  '/how-it-works' → HowItWorks
  ```

  ## Components

- **Pages:** Home, CustomerBooking, DriverDashboard, HowItWorks  
- **Shared Components:** Navbar, Footer, Buttons, Cards  
- **Services:** Injectable, singleton services for API and WhatsApp logic  

### Other Features
- Two-way data binding for forms  
- Event binding for buttons `(click)="..."`  
- Reactive forms for validation  
- Observables ready for real-time notifications  

---

## Backend & API

**Planned with Node.js / LoopBack 4:**

### Endpoints
- `POST /bookings` → create passenger booking  
- `GET /driver/:id/schedules` → fetch driver schedules  
- `POST /driver/:id/schedule` → create schedule  

### MongoDB Collections
- `users` → passengers & drivers  
- `bookings` → booking details  
- `schedules` → driver schedules and seat availability  

---

## WhatsApp Integration
- Angular service triggers backend / WhatsApp API  
- Sends structured booking messages:


- Handles booking confirmation buttons  

---

## Tech Stack
- **Frontend:** Angular 17+, TypeScript, SCSS  
- **Backend:** Node.js, LoopBack 4 (planned)  
- **Database:** MongoDB  
- **Messaging:** WhatsApp API  
- **Version Control:** Git & GitHub  

---

## Getting Started

### Clone the repo
```bash
git clone https://github.com/abimael92/driver-admin-portal.git
cd driver-admin-portal
```

## Getting Started

### Install Dependencies
```bash
npm install

```
### Run the App
```bash
npx ng serve --open
```

### Build for Production
```bash
ng build --configuration production
```
### Future Enhancements
- Add multiple routes and cities

- Passenger dashboard for booking history

- Payment integration

- User authentication

- Real-time updates with WebSockets or push notifications

 ## RutaFacil – Making ride management simple and seamless for drivers and passengers!

This keeps it **readable, organized, and ready to paste** into your README.md.  

I can now **combine all fixed sections into a full polished README** with diagrams and flow visuals for interview-ready documentation. Do you want me to do that?

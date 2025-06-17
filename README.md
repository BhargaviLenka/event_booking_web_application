![Screenshot from 2025-06-17 17-40-02](https://github.com/user-attachments/assets/be7e91bf-3772-4b66-bd93-13323808cb8f)# Event Booking Web Application

A full-stack event booking application built using **Django (REST API)** for the backend and **React + Vite** for the frontend. 
It enables users to book event time slots, view their booking history, and admins to manage event categories and availability.
---

## Tech Stack

* Backend: Django, Django REST Framework
* Frontend: React + Vite (Node.js v22)
* Database: SQLite (for development)
* Authentication: Django Sessions
* State Management: Redux
* UI Framework: Bootstrap + React-Bootstrap

---

##  Features

* User Registration & Login (Session-based)
* Weekly Calendar View for Booking Slots
* Role-based Functionality (Admin/User)
* Event Categories Management
* Time Slot Management
* Concurrency-safe Bookings using select\_for\_update(nowait=True)
* Booking Cancellation & History
* Toast Notifications
* Protected Routes
* Redux for store management

---

## Setup Instructions

## Git Clone Repository

  git clone https://github.com/BhargaviLenka/event_booking_web_application.git

## Backend (Django + SQLite)

1. Create and activate virtual environment:
   python3 -m venv env
   source env/bin/activate  # Windows: env\Scripts\activate


2. Install dependencies:
   pip install -r requirements.txt

3. Run migrations:
   python manage.py makemigrations
   python manage.py migrate

4. Start the development server:
   python manage.py runserver

> Backend URL: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## Frontend (React + Vite)

1. Go to frontend folder:
   cd booking-ui

2. Ensure Node.js v22 is active:
   node -v  # Should return v22.x // nvm use 22

3. Install dependencies:
   npm install

4. Run frontend:
   npm run dev

> Frontend URL: [http://localhost:5173/](http://localhost:5173/)

> Ensure that `.env` or `useAxios.js` is configured to point to your backend (e.g., [http://127.0.0.1:8000/](http://127.0.0.1:8000/))

---

## Model Structure Diagram
erDiagram
    User ||--o{ UserBooking : books
    EventAvailability ||--o{ UserBooking : is_booked_by
    EventAvailability }o--|| Category : belongs_to
    EventAvailability }o--|| TimeSlot : happens_at

    User {
        int id
        string username
        string email
        bool is_admin
    }
    UserBooking {
        int id
        datetime booked_at
        string status
    }
    EventAvailability {
        int id
        date date
        string status
    }
    Category {
        int id
        string name
    }
    TimeSlot {
        int id
        string start_time
        string end_time
    }

---

## Contributions

* Built full REST APIs for booking system
* Designed database models and relationships
* Implemented secure booking using select\_for\_update(nowait=True)
* Created a reusable Axios wrapper (useAxios) for API calls
* Developed protected routes with auto-session validation
* Handled both Admin & User logic in frontend cleanly

---
# Event Booking System Backend (Django REST Framework)
 
##  Overview
 
This project is a backend API built with **Django** and **Django REST Framework** that supports an **event booking system** with the following features:
- Slot availability management
- Time slot configurations
- User registration and authentication
- User-specific booking
- Admin category assignment
- Booking cancellation
- Session handling
 
---
 
## Features & API Endpoints
 
1. **Authentication & Session**
 
- `POST /api/login/`  
  Authenticate user using email and password.
 
- `POST /api/register/`  
  Register a new user account.
 
- `GET /api/check-session/`  
  Check whether a session is active, and retrieve user info.
 
- `POST /api/logout/`  
  Log out the currently authenticated user.
 
---
 
2. **Time Slot Management**
 
- `GET /api/timeslots/`  
  Initialize and fetch predefined time slots:
  - 09:00 - 12:00
  - 12:00 - 15:00
  - 15:00 - 18:00
 
---
 
3. **Event Availability (Admin)**
 
- `GET /api/event-availability/?dates[]=YYYY-MM-DD,...`  
  Returns available slots, with booking and self-booking status.
 
- `POST /api/event-availability/`  
  Create or update category for a time slot.
 
- `DELETE /api/event-availability/`  
  Delete availability unless it’s already booked.
 
> All logic is extracted into a **Manager class (`EventBookingManager`)** for modularity.
 
---
 
4. **User Booking**
 
- `GET /api/my-bookings/`  
  View bookings made by the currently authenticated user.
 
- `DELETE /api/my-bookings/{booking_id}/`  
  Cancel a specific booking.
 
- `POST /api/book/`  
  Book a time slot for a date and category.
 
- `GET /api/book/`  
  List all bookings of the current user (paginated).
 
---
 
5. **Admin Booking History**
 
- `GET /api/admin/user-bookings/`  
  (Admin-only) View all bookings filtered by user.

 
##  Contact

Bhargavi Lenka

lenkabhargavi2204@gmail.com

https://www.linkedin.com/in/lenka-bhargavi-profile/

https://github.com/BhargaviLenka/


 

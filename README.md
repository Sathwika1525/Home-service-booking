
# Home Service Booking Platform

A full-stack web application that allows customers to book home services and administrators to manage bookings.

## Features

### Customer
- View available home services and prices.
- Select a preferred booking date and time.
- Enter customer details and book a service.
- Prevent overlapping bookings.
- Validate booking time and service duration.

### Admin
- Secure admin login using JWT authentication.
- View all customer bookings.
- View customer details, service, booking time, and price.
- Cancel confirmed bookings.

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: JWT
- Password Hashing: bcryptjs

## Project Structure

- `client/` – React frontend
- `server/` – Express backend
- `README.md` – Project documentation

## Setup Instructions

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Home-service-booking
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder.

Add the following variables:

```env
DB_USER=your_database_username
DB_HOST=localhost
DB_NAME=home_service_booking
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=your_long_random_secret
```

Use your own PostgreSQL credentials and a secure JWT secret.

### 5. Start the backend

From the `server` folder:

```bash
node server.js
```

### 6. Start the frontend

From the `client` folder:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Admin Access

Use the admin account configured for your local environment.

## Future Improvements

- Deploy the application online.
- Add booking management features.
- Improve the admin dashboard UI.
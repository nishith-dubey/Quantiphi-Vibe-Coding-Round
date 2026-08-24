# Subscription Tracker & Renewal Dashboard

## 1. Project Overview

A simple MERN app for tracking subscription costs, renewal dates, and active or paused subscriptions.

Architecture:

```text
React frontend -> Express/Node backend -> MongoDB
```

## 2. Features

- Add a subscription with service name, cost, billing cycle, and next renewal date.
- View Monthly Burn Rate.
- View the count of renewals within the next 7 days.
- See all subscriptions in a table.
- Pause and resume subscriptions.
- Show paused subscriptions in grey.
- Keep subscription data after page refresh.

## 3. Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- Node.js
- Express
- MongoDB
- Mongoose

## 4. Simple Project Structure

```text
client/
  src/
    App.jsx
    App.css
    index.css
server/
  models/
    Subscription.js
  routes/
    subscriptions.js
  middleware/
    errorHandler.js
  db.js
  server.js
  .env
package.json
```

## 5. How the Application Works

The React frontend loads subscriptions from the Express API and displays the table and summary metrics. New subscriptions and status changes are sent to the backend with Axios. The backend validates and stores subscription documents in MongoDB through Mongoose.

## 6. API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API health |
| GET | `/api/subscriptions` | Get all subscriptions |
| POST | `/api/subscriptions` | Add a subscription |
| PATCH | `/api/subscriptions/:id` | Update a subscription, including active status |
| DELETE | `/api/subscriptions/:id` | Delete a subscription |

## 7. Database/Schema Overview

The `Subscription` model contains:

- `serviceName`: required string
- `cost`: required number, minimum `0`
- `billingCycle`: `Monthly` or `Yearly`
- `nextRenewalDate`: required date string
- `active`: boolean, defaulting to `true`
- `createdAt` and `updatedAt`: timestamps

## 8. Monthly Cost and Renewal Logic

- Monthly subscriptions use their full cost.
- Yearly subscriptions use `cost / 12` for Monthly Burn.
- Only active subscriptions count toward Monthly Burn.
- A renewal is considered soon when its date is today through 7 days from today.
- Renewals within 7 days show **Renewing Soon**.

## 9. Active/Paused Behavior

- Pausing updates the subscription's `active` value to `false`.
- Paused subscriptions remain stored in MongoDB.
- Paused rows become grey in the UI.
- Paused subscriptions are excluded from Monthly Burn.
- Resuming sets `active` to `true` and adds the cost back to Monthly Burn.

## 10. How to Install and Run

Requirements: Node.js, npm, and a running MongoDB instance.

From the project root:

```powershell
npm run install:all
```

Start the backend:

```powershell
npm run dev:server
```

In another terminal, start the frontend:

```powershell
npm run dev:client
```

The frontend runs at the Vite URL shown in the terminal, normally `http://localhost:5173`.

## 11. Environment Variables

Create `server/.env` with:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/subtrack
PORT=5000
```

The frontend optionally supports:

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not set, the frontend uses that URL by default.

## 12. Short Testing/Demo Flow

1. Start MongoDB, the backend, and the frontend.
2. Add a monthly subscription and a yearly subscription.
3. Confirm Monthly Burn uses the monthly cost plus the yearly cost divided by 12.
4. Add a renewal dated within 7 days and confirm **Renewing Soon** appears.
5. Pause a subscription and confirm the row turns grey and Monthly Burn decreases.
6. Resume it and confirm the cost returns.
7. Refresh the page and confirm the subscriptions and statuses persist.

# 🧠 Habit Tracker API

A RESTful API built with **Node.js**, **Express**, and **MongoDB** for tracking habits and their daily logs.  
Implements a clean **3-layer architecture** (Controller → Service → Repository) to separate concerns and keep the code maintainable.

---

## 💡 Project Idea

The Habit Tracking API helps users build and maintain daily routines by tracking habits in a structured way. Users can create **two types of habits**:

1. **Boolean Habits** – Simple yes/no habits to mark whether a task was completed.
2. **Numeric Habits** – Quantitative habits that track measurable values. Each numeric habit has three levels to encourage consistency:
   - `min`: The minimum achievable value to ensure daily consistency.
   - `target`: The normal goal for typical days.
   - `best`: The value for the user’s best-performing days.

**Key Features:**

- Users provide their **timezone at signup**, which is fixed to calculate local dates for logs. Changing it later is **not allowed**, as it would cause inconsistencies.
- Each habit can be **logged only once per day**, but the **current day's log can be updated**.
- Boolean habit logs accept `0` or `1`. Numeric habit logs accept numerical values.
- Deleting a habit removes all its logs; deleting a log affects only that log.

## 🚀 Features

- **User Authentication**
  - Sign up, login, password reset
  - JWT-based authentication
- **Habit Management**
  - Create, update, delete habits
  - Fetch all habits for the logged-in user
- **Habit Logs**
  - Add daily logs for each habit
  - Fetch logs by month (with correct date ranges & habit creation date consideration)
  - Update logs by ID
- **Business Rules**
  - Ownership checks (user can only modify their own habits/logs)
  - Clean input data using middleware before hitting controllers
- **Timezone Support**
  - Monthly log ranges respect the user's timezone

---

## 🧩 Business Logic

- Users can create two types of habits:

  1. **Boolean Habit**: Simple yes/no tracking. Value: 0 (not done) or 1 (done).
  2. **Numeric Habit**: Tracks measurable quantities with three levels:
     - `min`: Minimum achievable value to stay consistent every day.
     - `target`: Normal goal value.
     - `best`: Value for best days.

- Users send their **timezone at signup**, which is **fixed forever** to compute local dates correctly. Changing the timezone later is **not allowed** to prevent inconsistencies in logs.

- Logging rules:

  - Each habit can be **logged only once per day**.
  - Users can **update only today’s log**.
  - Boolean logs: `0` or `1`.
  - Numeric logs: numerical value compared against `min`, `target`, and `best`.

- Updating habits:

  - Boolean habit: Only `title` and `description` can be updated.
  - Numeric habit: `title`, `description`, `min`, `target`, and `best` can be updated.
  - Logs cannot be updated via habit update endpoint.

- Deleting habits:
  - Deleting a habit removes all its logs.

## 🏗 Project Architecture

This project follows a **3-layer architecture**:

1. **Controller Layer**

   - Handles HTTP requests/responses
   - Calls services and returns status codes
   - Example: `habitController.createHabit`

2. **Service Layer**

   - Contains business logic
   - Verifies habit ownership, applies rules, validates conditions
   - Throws custom errors (`AppError`) when something fails
   - Example: `habitService.updateHabit`

3. **Repository Layer**
   - Handles all database operations
   - Communicates with Mongoose models (`User`, `Habit`, `HabitLog`)
   - Example: `userRepo.findHabitById`

This separation improves **testability**, **scalability**, and **readability**.

---

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JSON Web Token (JWT)
- **Date Handling:** Luxon
- **Error Handling:** Centralized `AppError` + global error middleware

---

---

## 📜 API Endpoints

### 🔑 Auth

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| POST   | `/api/v1/auth/signup`                     | Register a new user      |
| POST   | `/api/v1/auth/login`                      | Login and receive JWT    |
| POST   | `/api/v1/auth/forget-password`            | Send reset password link |
| PATCH  | `/api/v1/auth/reset-password/:resetToken` | Reset password           |

### 🏆 Habits

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/api/v1/habits`          | Get all user habits |
| POST   | `/api/v1/habits`          | Create a new habit  |
| PATCH  | `/api/v1/habits/:habitId` | Update a habit      |
| DELETE | `/api/v1/habits/:habitId` | Delete a habit      |

### 📅 Habit Logs

| Method | Endpoint                              | Description                                         |
| ------ | ------------------------------------- | --------------------------------------------------- |
| GET    | `/api/v1/habits/:habitId/logs`        | Get logs for a habit (supports `monthOffset` query) |
| POST   | `/api/v1/habits/:habitId/logs`        | Create a new log entry                              |
| PATCH  | `/api/v1/habits/:habitId/logs/:logId` | Update a specific log                               |

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abdall05/habit-tracking-api.git
   cd habit-tracking-api
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root:

   ```env
    PORT=3000
    DATABASE=mongodb+srv://<username>:<db_password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
    DB_PASSWORD=<your_db_password>
    SALT_ROUNDS=10
    JWT_SECRET=<your_jwt_secret>
    JWT_EXPIRES_IN=7d
    EMAIL_HOST=sandbox.smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USERNAME=<your_email_username>
    EMAIL_PASSWORD=<your_email_password>
    RESET_TOKEN_EXPIRES_IN=10
   ```

4. **Run in development**

   ```bash
   npm start
   ```

5. API base:
   ```
   http://localhost:3000/api/v1
   ```

---

## 🔑 Authentication

**Signup**

```
POST /api/v1/auth/signup
```

Request:

```json
{
  "name": "Ali",
  "email": "ali@gmail.com",
  "password": "12345678",
  "confirmPassword": "12345678",
  "timezone": "Europe/Berlin"
}
```

Response:

```json
{
  "status": "OK",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "68d0075fb54ed6446d0498d8",
      "name": "Ali",
      "email": "ali@gmail.com",
      "timezone": "Europe/Berlin"
    }
  }
}
```

**Note:** The `timezone` is fixed at signup and used for all log dates. It **cannot be changed**, otherwise logs may become inconsistent.

---

**Login**

```
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "ali@gmail.com",
  "password": "12345678"
}
```

Response:

```json
{
  "status": "OK",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "68d0075fb54ed6446d0498d8",
      "name": "Ali",
      "email": "ali@gmail.com",
      "timezone": "Europe/Berlin",
      "habits": []
    }
  }
}
```

---

## 📝 Habits

**Create Habit (Boolean)**

```
POST /api/v1/habits
Authorization: Bearer <token>
```

Request:

```json
{
  "title": "Go Out",
  "type": "boolean"
}
```

Response:

```json
{
  "status": "OK",
  "data": {
    "habit": {
      "id": "68d007b0b54ed6446d0498dc",
      "title": "Go Out",
      "type": "boolean",
      "createdAt": "2025-09-21",
      "latestLog": null
    }
  }
}
```

**Create Habit (Numeric)**

```
POST /api/v1/habits
Authorization: Bearer <token>
```

Request:

```json
{
  "title": "Coding",
  "type": "numeric",
  "unit": "minutes",
  "min": 30,
  "target": 90,
  "best": 180
}
```

Response:

```json
{
  "status": "OK",
  "data": {
    "habit": {
      "id": "68d00801b54ed6446d0498e1",
      "title": "Coding",
      "type": "numeric",
      "unit": "minutes",
      "min": 30,
      "target": 90,
      "best": 180,
      "createdAt": "2025-09-21",
      "latestLog": null
    }
  }
}
```

**Get All Habits**

```
GET /api/v1/habits
Authorization: Bearer <token>
```

Response:

```json
{
  "status": "OK",
  "data": {
    "habits": [
      {
        "id": "68d007b0b54ed6446d0498dc",
        "title": "Go Out",
        "type": "boolean",
        "createdAt": "2025-09-21",
        "latestLog": null
      },
      {
        "id": "68d00801b54ed6446d0498e1",
        "title": "Coding",
        "type": "numeric",
        "unit": "minutes",
        "min": 30,
        "target": 90,
        "best": 180,
        "createdAt": "2025-09-21",
        "latestLog": null
      }
    ]
  }
}
```

---

## 📊 Habit Logs

**Create Log (Boolean Habit)**

```
POST /api/v1/habits/:habitId/logs
Authorization: Bearer <token>
```

Request body can be empty `{}`; the server will set `value = 1` for completed.

```json
{}
```

Response:

```json
{
  "status": "OK",
  "data": {
    "habitId": "68d007b0b54ed6446d0498dc",
    "localDate": "2025-09-21",
    "value": 1,
    "id": "68d0096d08f41bfdb53d43cb"
  }
}
```

**Create Log (Numeric Habit)**

```
POST /api/v1/habits/:habitId/logs
Authorization: Bearer <token>
```

Request:

```json
{
  "value": 45
}
```

Response:

```json
{
  "status": "OK",
  "data": {
    "habitId": "68d00801b54ed6446d0498e1",
    "localDate": "2025-09-21",
    "value": 45,
    "min": 30,
    "target": 90,
    "best": 180,
    "id": "68d009c308f41bfdb53d43d0"
  }
}
```

## 📊 Get Logs for a Habit

**Endpoint**

```
GET /api/v1/habits/:habitId/logs?monthOffset=0
Authorization: Bearer <token>
```

**Query Parameters**

- `monthOffset` (optional, integer, default `0`):  
  Offset from the current month.
  - `0` = current month
  - `-1` = previous month
  - Future months are not allowed (`>0`).

**Response Structure**

- `habit`: habit details including `latestLog`
- `from` / `to`: the start and end dates for the requested month
- `logs`: array of logs in that month

**Numeric Habit Example**

```json
{
  "status": "OK",
  "data": {
    "habit": {
      "title": "coding",
      "createdAt": "2025-09-21",
      "latestLog": {
        "habitId": "68d00801b54ed6446d0498e1",
        "localDate": "2025-09-21",
        "value": 45,
        "min": 30,
        "target": 90,
        "best": 180,
        "id": "68d009c308f41bfdb53d43d0"
      },
      "type": "numeric",
      "unit": "minutes",
      "min": 30,
      "target": 90,
      "best": 180,
      "id": "68d00801b54ed6446d0498e1"
    },
    "from": "2025-09-01",
    "to": "2025-09-21",
    "logs": [
      {
        "localDate": "2025-09-21",
        "value": 45,
        "min": 30,
        "target": 90,
        "best": 180,
        "id": "68d009c308f41bfdb53d43d0"
      }
    ]
  }
}
```

**Boolean Habit Example**

```json
{
  "status": "OK",
  "data": {
    "habit": {
      "title": "go out",
      "createdAt": "2025-09-21",
      "latestLog": {
        "habitId": "68d007b0b54ed6446d0498dc",
        "localDate": "2025-09-21",
        "value": 1,
        "id": "68d0096d08f41bfdb53d43cb"
      },
      "type": "boolean",
      "id": "68d007b0b54ed6446d0498dc"
    },
    "from": "2025-09-01",
    "to": "2025-09-21",
    "logs": [
      {
        "localDate": "2025-09-21",
        "value": 1,
        "id": "68d0096d08f41bfdb53d43cb"
      }
    ]
  }
}
```

**Notes**

- `from` / `to` always cover the **requested month**.
- `habit.createdAt` should be used by the frontend to disable days **before the habit was created**.
- `latestLog` is included for quick reference.
- `value` for boolean habits: `0` = not done, `1` = done.
- Numeric habits include `min`, `target`, `best` for reference.

## ✏️ Update Habit & Logs

**Update Habit**

```
PATCH /api/v1/habits/:habitId
Authorization: Bearer <token>
```

- **Boolean habit:** Only `title` and `description` can be updated.
- **Numeric habit:** `title`, `description`, `min`, `target`, and `best` can be updated.
- Logs **cannot** be updated through this endpoint.

**Update Log**

```
PATCH /api/v1/habits/:habitId/logs/:logId
Authorization: Bearer <token>
```

- Only **today's log** can be updated.
- Request body should include only `value`.
  - Boolean habit: `value` must be `0` or `1`.
  - Numeric habit: `value` is a number.

## 📌 Logging Rules

- Each habit can be **logged only once per day**.
- Users can **update only today's log** using the `PATCH /api/v1/habits/:habitId/logs/:logId` endpoint.
- Attempting to create a log for a habit on the same day will not create a new entry; the existing log should be updated instead.
- Boolean habits: `value` must be `0` (not done) or `1` (done).
- Numeric habits: `value` is a number.

**Delete Habit**

```
DELETE /api/v1/habits/:habitId
Authorization: Bearer <token>
```

- Deleting a habit **also deletes all its logs**.
- Only the habit owner can perform this action.

## 🧪 Testing

Manual testing: Postman

## 🚀 Future Improvements

- Provide endpoints for statistics (weekly, monthly progress).
- Continue improving code modularity, maintainability

## 👤 Author

Ali Abdallah — student project for learning Node.js, Express, and MongoDB using clean architecture.

---

## 📄 License

MIT — free to use and modify for learning or personal projects.

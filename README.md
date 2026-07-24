# 🚕 Cab On Campus

Cab On Campus is a full-stack **campus cab booking platform** designed for students and drivers within **Thapar Institute of Engineering & Technology**.

The platform provides role-based functionality for **Students, Drivers, and Administrators**, allowing students to request rides, drivers to manage ride requests, and administrators to oversee the platform.

---

## ✨ Features

### 👨‍🎓 Student
- Register and login securely
- Book campus cab rides
- View ride details and status
- Track active and previous rides
- Manage profile
- Secure role-based access

### 🚗 Driver
- Driver-specific authentication and authorization
- View available ride requests
- Accept and manage rides
- Update ride status
- View assigned rides

### 🛡️ Admin
- Manage users and drivers
- Monitor rides
- Administrative platform controls
- Role-based protected endpoints

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Redis
- Maven

### Database
- PostgreSQL

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Tools
- Git & GitHub
- Postman
- Swagger / OpenAPI
- IntelliJ IDEA

---

## 🏗️ Backend Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Additional components include:

```text
Client
  ↓
Spring Security
  ↓
JWT Authentication Filter
  ↓
Controllers
  ↓
Service Layer
  ↓
Repository Layer
  ↓
PostgreSQL
```

Redis is used where fast temporary data access is required.

---

## 🔐 Authentication & Authorization

Authentication is implemented using **Spring Security and JWT**.

The application supports role-based authorization for:

```text
STUDENT
DRIVER
ADMIN
```

Protected APIs can only be accessed with a valid JWT token and the required role.

---

## 🚕 Ride Lifecycle

A typical ride follows the workflow:

```text
Student requests ride
        ↓
Ride created
        ↓
Driver receives/accepts ride
        ↓
Ride starts
        ↓
Ride completed
```

Ride state is maintained by the backend to ensure valid transitions throughout the booking lifecycle.

---

## 🗄️ Database

The application uses **PostgreSQL** as its primary relational database.

Spring Data JPA and Hibernate are used for:

- Entity relationships
- Database persistence
- Repository abstraction
- JPQL queries
- Transaction management

---

## ⚡ Redis

Redis is integrated into the backend for temporary and fast-access data where appropriate.

This reduces unnecessary database operations for short-lived application data.

---

## 📦 DTO-Based API Design

DTOs are used instead of exposing database entities directly through the API.

```text
HTTP Request
     ↓
Request DTO
     ↓
Service Layer
     ↓
Entity
     ↓
Database
```

Responses are similarly mapped to dedicated response DTOs.

This provides better separation between the API and persistence layers.

---

## ⚠️ Exception Handling

The backend implements centralized exception handling to provide consistent API error responses.

Example:

```json
{
  "message": "Ride not found",
  "status": 404
}
```

---

## 📖 API Documentation

Backend APIs are documented using **Swagger / OpenAPI**.

After running the backend, Swagger UI can be used to explore and test available endpoints.

```text
http://localhost:8080/swagger-ui/index.html
```

---

## ⚙️ Running Locally

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd cab-on-campus
```

### 2. Configure PostgreSQL

Create a PostgreSQL database and configure your environment variables/application properties.

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cab_on_campus
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Configure Redis

Make sure Redis is running locally:

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

### 4. Start the backend

```bash
mvn spring-boot:run
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 Links

- **Live Application:** `<YOUR_LIVE_URL>`
- **Swagger API:** `<YOUR_SWAGGER_URL>`
- **Backend Repository:** `<YOUR_BACKEND_URL>`

---

## 👨‍💻 Author

**Harnimarpreet Singh**

Built as a full-stack project focused on applying **Spring Boot, REST API design, authentication & authorization, PostgreSQL, Redis, and scalable backend architecture** to a real-world campus transportation use case.

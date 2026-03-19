# VP Backend API

Backend service for **Victoria Property**, built with **Go (Gin Framework)** using **Clean Architecture** principles.<br>
API Endpoint Documentations: [Victoria Property API Docs](https://documenter.getpostman.com/view/49258155/2sBXVihAPb)

--- 

## Tech Stack

* Go 1.22+
* Gin Gonic
* MySQL
* JWT Authentication
* bcrypt
* Clean Architecture (Domain, Repository, Service, Handler)

---

## Project Structure

```bash
.
├── cmd/api/main.go            # Application entry point
├── internal
│   ├── config                 # App & DB configuration
│   ├── delivery/http          # HTTP layer
│   │   ├── handler            # Request handlers
│   │   ├── middleware         # JWT & admin middleware
│   │   └── routes.go          # Route definitions
│   ├── domain                 # Entities & domain errors
│   ├── repository             # Database access layer
│   └── service                # Business logic
├── migrations                 # SQL schema & seed data
├── pkg/utils                  # Shared utilities
└── README.md
```

---

## Architecture Overview

```
Request
  ↓
Handler (HTTP)
  ↓
Service (Business Logic)
  ↓
Repository (Database)
  ↓
MySQL
```

Each layer has a single responsibility and is loosely coupled.

---

## Authentication

* JWT-based authentication
* Token valid for **7 days**
* `Authorization: Bearer <token>`

---

## How to Run

```bash
go mod tidy
go run cmd/api/main.go
```

---

## Notes

* Passwords are hashed using bcrypt
* Admin-only routes protected via middleware
* Pagination max limit: **100**

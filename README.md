# Inventory & Order Management System

A full-stack Inventory & Order Management System built using React, FastAPI, PostgreSQL, and Docker. The application enables businesses to efficiently manage products, customers, orders, and inventory through a modern web interface.

---

## Live Demo

### Frontend

https://inventory-management-system-gold-six.vercel.app

### Backend API

https://inventory-management-system-ltki.onrender.com

### API Documentation

https://inventory-management-system-ltki.onrender.com/docs

### Docker Image

https://hub.docker.com/r/himanshurai3721/inventory-backend

---

## Features

### Product Management

* Create products
* Update products
* Delete products
* View product inventory
* Unique SKU validation

### Customer Management

* Create customers
* Delete customers
* View customer information
* Unique email validation

### Order Management

* Create orders
* View orders
* View order details
* Automatic inventory deduction
* Stock availability validation

### Dashboard

* Total Products
* Total Customers
* Total Orders
* Low Stock Product Monitoring

---

## Business Rules Implemented

### Product Rules

* Product SKU must be unique.

### Customer Rules

* Customer email must be unique.

### Order Rules

* Orders cannot be created if stock is insufficient.
* Product inventory is automatically reduced when an order is placed.

---

## Technology Stack

### Frontend

* React
* Vite
* Axios
* Bootstrap

### Backend

* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Database

* PostgreSQL

### DevOps & Deployment

* Docker
* Docker Compose
* Render
* Vercel
* Docker Hub

---

## Project Architecture

Frontend (React + Vite)
↓
Backend API (FastAPI)
↓
PostgreSQL Database

---

## Running Locally

### Clone Repository

```bash
git clone https://github.com/Himanshurai3721/inventory-management-system.git
cd inventory-management-system
```

### Start Application

```bash
docker compose up --build
```

### Application URLs

Frontend:
http://localhost:5173

Backend API:
http://localhost:8000

Swagger API Docs:
http://localhost:8000/docs

---

## Environment Variables

### Backend

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=
```

---

## Deployment

| Service             | Platform          |
| ------------------- | ----------------- |
| Frontend            | Vercel            |
| Backend API         | Render            |
| PostgreSQL Database | Render PostgreSQL |
| Docker Image        | Docker Hub        |

---

## Repository

GitHub:
https://github.com/Himanshurai3721/inventory-management-system

Docker Hub:
https://hub.docker.com/r/himanshurai3721/inventory-backend

---



Himanshu Kumar Rai

B.Tech Computer Science Engineering

Full Stack Development | Software Engineering | AI & Data

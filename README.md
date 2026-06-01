# Inventory & Order Management System

## Overview

A full-stack Inventory & Order Management System built with:

* React
* FastAPI
* PostgreSQL
* Docker
* Docker Compose

The application allows businesses to:

* Manage products
* Manage customers
* Create and track orders
* Monitor inventory levels
* View dashboard statistics

---

## Features

### Product Management

* Create products
* View products
* Update products
* Delete products
* Unique SKU validation

### Customer Management

* Create customers
* View customers
* Delete customers
* Unique email validation

### Order Management

* Create orders
* View orders
* View order details
* Inventory deduction on order creation
* Stock validation

### Dashboard

* Total products
* Total customers
* Total orders
* Low stock products

---

## Tech Stack

### Frontend

* React
* Vite

### Backend

* FastAPI
* SQLAlchemy
* Pydantic

### Database

* PostgreSQL

### DevOps

* Docker
* Docker Compose

---

## Running Locally

### Start the application

docker compose up --build

### Frontend

http://localhost:5173

### Backend API

http://localhost:8000

### Swagger Documentation

http://localhost:8000/docs

---

## Environment Variables

POSTGRES_USER

POSTGRES_PASSWORD

POSTGRES_DB

DATABASE_URL

---

## Deployment

Frontend: Vercel

Backend: Render

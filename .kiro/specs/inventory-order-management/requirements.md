# Requirements Document

## Introduction

This document defines the requirements for a production-ready Inventory & Order Management System. The system consists of a FastAPI backend, a React (Vite) frontend, and a PostgreSQL database, all containerized with Docker Compose. It enables businesses to manage their product catalog, customer records, and sales orders through a web interface, with automatic inventory tracking and order total calculation.

## Glossary

- **API**: The FastAPI backend application that exposes RESTful HTTP endpoints.
- **Database**: The PostgreSQL relational database that persists all application data.
- **Product**: A sellable item with a name, unique SKU, price, and available stock quantity.
- **Customer**: A registered buyer identified by a unique email address.
- **Order**: A sales transaction linking a Customer to one or more Products via OrderItems.
- **OrderItem**: A line item within an Order that records the Product, quantity purchased, and unit price at time of purchase.
- **SKU**: Stock Keeping Unit — a unique alphanumeric identifier for a Product.
- **Low Stock**: A Product whose quantity is greater than zero but less than or equal to 10 units.
- **Dashboard**: A summary view aggregating key business metrics across Products, Customers, and Orders.
- **Frontend**: The React (Vite) single-page application that users interact with via a browser.
- **Docker_Compose**: The container orchestration configuration that starts the Frontend, API, and Database services together.

---

## Requirements

### Requirement 1: Product Management

**User Story:** As a business operator, I want to create, view, update, and delete products, so that I can maintain an accurate product catalog with current stock levels and pricing.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/products` with a name (1–200 characters), a SKU (1–100 characters), a price (0.01–999,999,999.99), and a quantity (0–999,999), THE API SHALL create the Product and return HTTP 201 with the created Product's id, name, SKU, price, and quantity in the response body.
2. IF a POST request is sent to `/products` with a SKU that already exists in the Database, THEN THE API SHALL return HTTP 409 with an error message indicating the conflicting SKU.
3. IF a POST request is sent to `/products` with a quantity less than zero or a price less than or equal to zero, THEN THE API SHALL return HTTP 422 with an error message indicating the invalid field and the violated constraint.
4. WHEN a GET request is sent to `/products`, THE API SHALL return HTTP 200 with a list of all Products, each containing id, name, SKU, price, and quantity.
5. WHEN a GET request is sent to `/products/{id}` with a valid Product id, THE API SHALL return HTTP 200 with the matching Product's id, name, SKU, price, and quantity.
6. IF a GET request is sent to `/products/{id}` with an id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing resource.
7. WHEN a PUT request is sent to `/products/{id}` with valid updated fields (name 1–200 chars, SKU 1–100 chars, price 0.01–999,999,999.99, quantity 0–999,999), THE API SHALL update the Product and return HTTP 200 with the updated Product's id, name, SKU, price, and quantity.
8. IF a PUT request is sent to `/products/{id}` with an id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing resource.
9. IF a PUT request is sent to `/products/{id}` with an updated SKU that already belongs to a different Product, THEN THE API SHALL return HTTP 409 with an error message indicating the conflicting SKU.
10. WHEN a DELETE request is sent to `/products/{id}` with a valid Product id, THE API SHALL delete the Product and return HTTP 204.
11. IF a DELETE request is sent to `/products/{id}` with an id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing resource.

---

### Requirement 2: Customer Management

**User Story:** As a business operator, I want to register, view, and remove customers, so that I can associate orders with identifiable buyers.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/customers` with a full_name (1–100 characters), a valid RFC 5321 email (max 254 characters), and a phone (7–15 digits), THE API SHALL create the Customer and return HTTP 201 with the created Customer's id, full_name, email, and phone.
2. IF a POST request is sent to `/customers` with a missing or invalid field (full_name empty, email not RFC format, phone not 7–15 digits), THEN THE API SHALL return HTTP 422 with an error message identifying the invalid field and the violated constraint.
3. IF a POST request is sent to `/customers` with an email that already exists in the Database, THEN THE API SHALL return HTTP 409 with an error message indicating the duplicate email.
4. WHEN a GET request is sent to `/customers`, THE API SHALL return HTTP 200 with a list of all Customers ordered by created_at ascending, each containing id, full_name, email, and phone.
5. WHEN a GET request is sent to `/customers/{id}` with a valid Customer id, THE API SHALL return HTTP 200 with the matching Customer's id, full_name, email, and phone.
6. IF a GET request is sent to `/customers/{id}` with an id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing resource.
7. WHEN a DELETE request is sent to `/customers/{id}` with a valid Customer id and no associated Orders in the Database, THE API SHALL delete the Customer and return HTTP 204.
8. IF a DELETE request is sent to `/customers/{id}` and the Customer has one or more associated Orders in the Database, THEN THE API SHALL return HTTP 409 with an error message indicating the Customer cannot be deleted while orders exist.
9. IF a DELETE request is sent to `/customers/{id}` with an id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing resource.

---

### Requirement 3: Order Management and Inventory Deduction

**User Story:** As a business operator, I want to create and view orders, so that I can record sales transactions and have inventory automatically adjusted.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/orders` with a valid customer_id and a non-empty list of order items (each with a valid product_id and a quantity of at least 1), THE API SHALL, within a single database transaction: create the Order, create each OrderItem recording the Product's current price as unit_price, deduct the purchased quantity from each Product's stock, calculate total_amount as the sum of (unit_price × quantity) for all OrderItems, and return HTTP 201 with the created Order including its id, customer_id, total_amount, created_at, and the list of OrderItems.
2. IF a POST request is sent to `/orders` and any requested item quantity exceeds the available stock for that Product in the Database, THEN THE API SHALL return HTTP 400 with an error message identifying the Product name and available stock, and THE API SHALL NOT modify any Product quantity or create any Order or OrderItem.
3. IF a POST request is sent to `/orders` with a customer_id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing Customer.
4. IF a POST request is sent to `/orders` with a product_id in the items list that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing Product.
5. IF a POST request is sent to `/orders` with an empty items list, THEN THE API SHALL return HTTP 422 with an error message indicating that at least one order item is required.
6. WHEN a GET request is sent to `/orders`, THE API SHALL return HTTP 200 with a list of all Orders, each containing id, customer_id, total_amount, and created_at.
7. WHEN a GET request is sent to `/orders/{id}` with a valid Order id, THE API SHALL return HTTP 200 with the Order's id, customer_id, total_amount, created_at, and the full list of its associated OrderItems (each with id, product_id, quantity, and unit_price).
8. IF a GET request is sent to `/orders/{id}` with an id that does not exist in the Database, THEN THE API SHALL return HTTP 404 with an error message indicating the missing resource.
9. WHEN a DELETE request is sent to `/orders/{id}` with a valid Order id, THE API SHALL delete the Order and all its associated OrderItems and return HTTP 204.
10. THE API SHALL record the unit_price on each OrderItem at the time the Order is created, so that subsequent changes to a Product's price do not alter historical Order totals.

---

### Requirement 4: Dashboard Metrics

**User Story:** As a business operator, I want to view a summary dashboard, so that I can quickly assess the state of my inventory and sales activity.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/dashboard`, THE API SHALL return HTTP 200 with: total_products (integer count of all Products), total_customers (integer count of all Customers), total_orders (integer count of all Orders), and low_stock_products (list of up to 100 Products whose quantity is greater than zero and less than or equal to 10, each containing id, name, SKU, and quantity).
2. WHILE the Database contains no Products, Customers, or Orders, THE API SHALL return HTTP 200 with zero for each count field and an empty list for low_stock_products.
3. IF the Database is unavailable when a GET request is sent to `/dashboard`, THEN THE API SHALL return HTTP 503 with an error message indicating the service is temporarily unavailable.

---

### Requirement 5: Frontend — Product Pages

**User Story:** As a business operator, I want a web interface to manage products, so that I can perform catalog operations without using API tools directly.

#### Acceptance Criteria

1. WHEN the user navigates to the Products page, THE Frontend SHALL send a GET request to `/products` and display the returned list showing name, SKU, price, and quantity for each Product.
2. IF the GET request to `/products` fails, THEN THE Frontend SHALL display an error message containing the API-returned error text and leave the product list empty.
3. WHEN the user submits the Add Product form with a name (1–200 chars), a SKU (1–100 chars), a price (≥ 0.01), and a quantity (≥ 0), THE Frontend SHALL send a POST request to `/products` and, on HTTP 201, refresh the product list from the API.
4. WHEN the user submits the Edit Product form with valid updated fields, THE Frontend SHALL send a PUT request to `/products/{id}` and, on HTTP 200, refresh the product list from the API.
5. WHEN the user confirms deletion of a Product, THE Frontend SHALL send a DELETE request to `/products/{id}` and, on HTTP 204, remove the Product from the displayed list.
6. IF the API returns an error response (4xx or 5xx) during any Product operation, THEN THE Frontend SHALL display an error message containing the API-returned error text, and the message SHALL remain visible until the user dismisses it.

---

### Requirement 6: Frontend — Customer Pages

**User Story:** As a business operator, I want a web interface to manage customers, so that I can register and review buyer records without using API tools directly.

#### Acceptance Criteria

1. WHEN the user navigates to the Customers page, THE Frontend SHALL send a GET request to `/customers` and display the returned list showing full_name, email, and phone for each Customer; while the request is in flight THE Frontend SHALL display a loading indicator.
2. WHEN the user submits the Add Customer form with a full_name (1–100 chars), a valid email, and a phone (7–15 digits), THE Frontend SHALL send a POST request to `/customers` and, on HTTP 201, refresh the customer list from the API.
3. IF the user submits the Add Customer form with an empty full_name, an invalid email format, or a phone outside 7–15 digits, THEN THE Frontend SHALL display a field-level validation error before sending any API request.
4. WHEN the user confirms deletion of a Customer, THE Frontend SHALL send a DELETE request to `/customers/{id}` and, on HTTP 204, remove the Customer from the displayed list.
5. IF the API returns an error response (4xx or 5xx) during any Customer operation, THEN THE Frontend SHALL display an error message containing the API-returned error text.

---

### Requirement 7: Frontend — Order Pages

**User Story:** As a business operator, I want a web interface to create and review orders, so that I can record sales and inspect order details without using API tools directly.

#### Acceptance Criteria

1. WHEN the user navigates to the Orders page, THE Frontend SHALL send a GET request to `/orders` and display the returned list showing order id, the associated Customer's full_name (resolved from the customer_id), total_amount, and created_at for each Order.
2. WHEN the user submits the Create Order form by selecting an existing Customer from a dropdown and adding at least one order item (each with a Product selected from a dropdown and a quantity of at least 1), THE Frontend SHALL send a POST request to `/orders` and, on HTTP 201, refresh the orders list from the API.
3. WHEN the user selects an Order to view its details, THE Frontend SHALL send a GET request to `/orders/{id}` and display the Order's id, customer full_name, total_amount, created_at, and all associated OrderItems with product name, quantity, and unit_price; IF the request fails THEN THE Frontend SHALL display an error message containing the API-returned error text.
4. WHEN the user confirms deletion of an Order, THE Frontend SHALL send a DELETE request to `/orders/{id}` and, on HTTP 204, remove the Order from the displayed list.
5. IF the API returns an error response (4xx or 5xx) during any Order operation, THEN THE Frontend SHALL display an error message that includes the reason from the API response and remains visible until dismissed.

---

### Requirement 8: Frontend — Dashboard Page

**User Story:** As a business operator, I want a dashboard home page, so that I can see key metrics at a glance when I open the application.

#### Acceptance Criteria

1. WHEN the user navigates to the Dashboard page, THE Frontend SHALL display four summary cards labelled: Total Products, Total Customers, Total Orders, and Low Stock Products.
2. WHEN the Dashboard page loads, THE Frontend SHALL display a loading indicator, send a GET request to `/dashboard`, and on success populate each card with the returned values and hide the loading indicator.
3. IF the GET request to `/dashboard` fails, THEN THE Frontend SHALL hide the loading indicator and display an error message containing the API-returned error text, leaving all card values empty.
4. WHEN the Low Stock Products count is greater than zero, THE Frontend SHALL display the names of up to 10 low-stock Products below the summary cards.

---

### Requirement 9: Containerization and Service Orchestration

**User Story:** As a developer, I want the entire application to start with a single Docker Compose command, so that I can run the system in any environment without manual setup.

#### Acceptance Criteria

1. THE Docker_Compose SHALL define three services: frontend (React Vite served via Node), backend (FastAPI via Uvicorn), and postgres (PostgreSQL 15 or later).
2. WHEN `docker compose up` is executed on a machine with Docker installed, THE Docker_Compose SHALL start all three services such that the API returns HTTP 200 on `GET http://localhost:8000/docs` within 30 seconds and the Frontend returns HTTP 200 on `GET http://localhost:5173` within 30 seconds.
3. THE Docker_Compose SHALL use a named PostgreSQL volume (e.g., `postgres_data`) so that database data persists across `docker compose down` and `docker compose up` cycles (without the `-v` flag).
4. THE Docker_Compose SHALL configure the backend service with a `depends_on` condition of `service_healthy` for the postgres service, where the postgres healthcheck executes `pg_isready -U ${POSTGRES_USER}` at 5-second intervals with a 5-second timeout and 5 retries before the service is considered healthy.
5. WHERE the `DATABASE_URL` environment variable is set in the backend service's environment, THE API SHALL use it as the SQLAlchemy async connection string to connect to the Database; if `DATABASE_URL` is not set, THE API SHALL log an error at startup and exit with a non-zero status code.
6. THE Docker_Compose SHALL pass all required environment variables (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL) to the backend service so that no database credentials are hard-coded in any source file.

# Implementation Plan: Inventory & Order Management System

## Overview

Implement a full-stack Inventory & Order Management System using FastAPI (async, Python 3.11+) for the backend, React 19 (Vite) for the frontend, and PostgreSQL 15 as the database, all orchestrated via Docker Compose. The implementation follows the module structure defined in the design document, building from infrastructure outward: database layer → ORM models → Pydantic schemas → service logic → route handlers → frontend pages → containerization.

---

## Tasks

- [x] 1. Set up project infrastructure and Docker Compose
  - [x] 1.1 Create Docker Compose configuration with three services
    - Write `docker-compose.yml` at the workspace root defining `frontend`, `backend`, and `postgres` services
    - Configure `postgres` service with image `postgres:15`, named volume `postgres_data`, and healthcheck using `pg_isready -U ${POSTGRES_USER}` at 5-second intervals, 5-second timeout, 5 retries
    - Configure `backend` service with `depends_on: postgres: condition: service_healthy`, expose port 8000, pass `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` as environment variables
    - Configure `frontend` service to serve the Vite preview on port 5173
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 1.2 Create backend Dockerfile and requirements file
    - Write `backend/Dockerfile` using `python:3.11-slim` base image, install dependencies from `requirements.txt`, set `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`
    - Ensure `backend/requirements.txt` contains: `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `asyncpg`, `pydantic[email]`, `python-dotenv`, `alembic`, `pytest`, `pytest-asyncio`, `httpx`, `hypothesis`, `aiosqlite`
    - _Requirements: 9.1, 9.2_

  - [x] 1.3 Create frontend Dockerfile
    - Write `frontend/Dockerfile` using `node:20-alpine` base image, run `npm ci`, `npm run build`, and serve with `npm run preview -- --host 0.0.0.0 --port 5173`
    - _Requirements: 9.1, 9.2_

- [x] 2. Implement backend database layer
  - [x] 2.1 Create async database session module
    - Write `backend/app/database/__init__.py` (empty)
    - Write `backend/app/database/session.py` with:
      - `create_async_engine` using `DATABASE_URL` from environment; log error and `sys.exit(1)` if `DATABASE_URL` is not set
      - `AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)`
      - `async def get_db()` FastAPI dependency that yields an `AsyncSession`
    - _Requirements: 9.5_

  - [x] 2.2 Create SQLAlchemy ORM models
    - Write `backend/app/models/__init__.py` (empty)
    - Write `backend/app/models/models.py` with four mapped classes using `DeclarativeBase`:
      - `Product`: `id`, `name` (VARCHAR 200, NOT NULL), `sku` (VARCHAR 100, UNIQUE, NOT NULL), `price` (NUMERIC 15,2, CHECK > 0), `quantity` (INTEGER, DEFAULT 0, CHECK >= 0), `created_at`, `updated_at`
      - `Customer`: `id`, `full_name` (VARCHAR 100, NOT NULL), `email` (VARCHAR 254, UNIQUE, NOT NULL), `phone` (VARCHAR 15, NOT NULL), `created_at`
      - `Order`: `id`, `customer_id` (FK → customers.id), `total_amount` (NUMERIC 15,2, CHECK >= 0), `created_at`; relationship to `OrderItem`
      - `OrderItem`: `id`, `order_id` (FK → orders.id, ON DELETE CASCADE), `product_id` (FK → products.id), `quantity` (CHECK >= 1), `unit_price` (NUMERIC 15,2, CHECK > 0)
    - _Requirements: 1.1, 2.1, 3.1, 3.10_

- [x] 3. Implement Pydantic schemas
  - [x] 3.1 Create product schemas
    - Write `backend/app/schemas/__init__.py` (empty)
    - Write `backend/app/schemas/product.py` with `ProductCreate`, `ProductUpdate`, and `ProductResponse` as defined in the design document (field constraints: name 1–200, sku 1–100, price gt=0 le=999999999.99, quantity ge=0 le=999999)
    - _Requirements: 1.1, 1.3, 1.7_

  - [x] 3.2 Create customer schemas
    - Write `backend/app/schemas/customer.py` with `CustomerCreate` (full_name 1–100, EmailStr, phone pattern `^\d{7,15}$`) and `CustomerResponse`
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Create order schemas
    - Write `backend/app/schemas/order.py` with `OrderItemCreate` (product_id, quantity ge=1), `OrderCreate` (customer_id, items min_length=1), `OrderItemResponse`, `OrderResponse`, and `OrderSummaryResponse`
    - _Requirements: 3.1, 3.5, 3.7_

  - [x] 3.4 Create dashboard schema
    - Write `backend/app/schemas/dashboard.py` with `LowStockProduct` and `DashboardResponse`
    - _Requirements: 4.1_

- [x] 4. Implement FastAPI app factory
  - [x] 4.1 Create main.py with app factory, CORS, and router registration
    - Write `backend/app/main.py`:
      - Create `FastAPI` app instance with title and version
      - Add `CORSMiddleware` allowing origin `http://localhost:5173`, all methods, all headers
      - Import and include routers from `app.routes.products`, `app.routes.customers`, `app.routes.orders`, `app.routes.dashboard`
      - Add startup event that calls `Base.metadata.create_all` via the async engine to auto-create tables
    - _Requirements: 9.2_

- [x] 5. Implement product service and routes
  - [x] 5.1 Implement product service
    - Write `backend/app/services/__init__.py` (empty)
    - Write `backend/app/services/product_service.py` with async functions:
      - `create_product(db, data)`: insert product; catch `IntegrityError` for duplicate SKU → raise `HTTPException(409)`
      - `list_products(db)`: return all products
      - `get_product(db, product_id)`: return product or raise `HTTPException(404)`
      - `update_product(db, product_id, data)`: update fields; catch `IntegrityError` for duplicate SKU → raise `HTTPException(409)`; raise `HTTPException(404)` if not found
      - `delete_product(db, product_id)`: delete or raise `HTTPException(404)`
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

  - [x] 5.2 Implement product routes
    - Write `backend/app/routes/__init__.py` (empty)
    - Write `backend/app/routes/products.py` with an `APIRouter(prefix="/products")`:
      - `POST /` → `create_product` → 201 `ProductResponse`
      - `GET /` → `list_products` → 200 `list[ProductResponse]`
      - `GET /{id}` → `get_product` → 200 `ProductResponse`
      - `PUT /{id}` → `update_product` → 200 `ProductResponse`
      - `DELETE /{id}` → `delete_product` → 204
    - _Requirements: 1.1–1.11_

  - [ ]* 5.3 Write property test for SKU uniqueness invariant (Property 1)
    - **Property 1: SKU Uniqueness Invariant**
    - Use `@given(st.text(min_size=1, max_size=100))` to generate a random SKU; POST two products with the same SKU; assert second returns HTTP 409; assert only one product with that SKU exists via `GET /products`; repeat for PUT (update a different product to the same SKU)
    - **Validates: Requirements 1.2, 1.9**

  - [ ]* 5.4 Write property test for product CRUD round-trip (Property 2)
    - **Property 2: Product CRUD Round-Trip**
    - Use `@given(...)` to generate valid `ProductCreate` payloads; POST; GET by returned id; assert all fields match; generate `ProductUpdate`; PUT; GET again; assert updated fields match
    - **Validates: Requirements 1.1, 1.5, 1.7**

- [x] 6. Implement customer service and routes
  - [x] 6.1 Implement customer service
    - Write `backend/app/services/customer_service.py` with async functions:
      - `create_customer(db, data)`: insert; catch `IntegrityError` for duplicate email → raise `HTTPException(409)`
      - `list_customers(db)`: return all customers ordered by `created_at` asc
      - `get_customer(db, customer_id)`: return or raise `HTTPException(404)`
      - `delete_customer(db, customer_id)`: check for associated orders → raise `HTTPException(409)` if any exist; else delete or raise `HTTPException(404)`
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 6.2 Implement customer routes
    - Write `backend/app/routes/customers.py` with an `APIRouter(prefix="/customers")`:
      - `POST /` → `create_customer` → 201 `CustomerResponse`
      - `GET /` → `list_customers` → 200 `list[CustomerResponse]`
      - `GET /{id}` → `get_customer` → 200 `CustomerResponse`
      - `DELETE /{id}` → `delete_customer` → 204
    - _Requirements: 2.1–2.9_

  - [ ]* 6.3 Write property test for customer email uniqueness invariant (Property 6)
    - **Property 6: Customer Email Uniqueness Invariant**
    - Use `@given(emails())` to generate a random email; POST two customers with the same email; assert second returns HTTP 409; assert only one customer with that email exists
    - **Validates: Requirements 2.3**

  - [ ]* 6.4 Write property test for customer CRUD round-trip (Property 7)
    - **Property 7: Customer CRUD Round-Trip**
    - Use `@given(...)` to generate valid `CustomerCreate` payloads; POST; GET by returned id; assert `full_name`, `email`, `phone` match exactly
    - **Validates: Requirements 2.1, 2.5**

  - [ ]* 6.5 Write property test for customer deletion blocked by orders (Property 8)
    - **Property 8: Customer Deletion Blocked by Orders**
    - Create a customer; create at least one order for that customer; attempt `DELETE /customers/{id}`; assert HTTP 409; `GET /customers/{id}` returns 200
    - **Validates: Requirements 2.8**

- [x] 7. Checkpoint — Ensure all product and customer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement order service and routes
  - [x] 8.1 Implement order service
    - Write `backend/app/services/order_service.py` with async functions:
      - `create_order(db, data)`: execute inside `async with session.begin()`:
        1. Verify `customer_id` exists → 404 if not
        2. For each item: `SELECT ... FOR UPDATE` on product → 404 if not found; check `quantity >= item.quantity` → 400 with product name and available stock if insufficient
        3. `INSERT` into `orders` with `total_amount=0`
        4. For each item: `INSERT` into `order_items` with `unit_price=product.price`; `UPDATE` product quantity
        5. Compute `total_amount = SUM(unit_price * quantity)`; `UPDATE` order
      - `list_orders(db)`: return all orders as `OrderSummaryResponse`
      - `get_order(db, order_id)`: return order with items eagerly loaded or raise `HTTPException(404)`
      - `delete_order(db, order_id)`: delete order (cascade deletes items) or raise `HTTPException(404)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 8.2 Implement order routes
    - Write `backend/app/routes/orders.py` with an `APIRouter(prefix="/orders")`:
      - `POST /` → `create_order` → 201 `OrderResponse`
      - `GET /` → `list_orders` → 200 `list[OrderSummaryResponse]`
      - `GET /{id}` → `get_order` → 200 `OrderResponse`
      - `DELETE /{id}` → `delete_order` → 204
    - _Requirements: 3.1–3.10_

  - [ ]* 8.3 Write property test for order total calculation and stock deduction (Property 3)
    - **Property 3: Order Total Calculation and Stock Deduction**
    - Generate random products with sufficient stock and a random order over those products; POST to `/orders`; assert `total_amount == sum(unit_price * qty for each item)`; assert each product's quantity decreased by the ordered amount
    - **Validates: Requirements 3.1**

  - [ ]* 8.4 Write property test for unit price snapshot immutability (Property 4)
    - **Property 4: Unit Price Snapshot Immutability**
    - Create an order; record `unit_price` values; update each referenced product's price to a different random value; `GET /orders/{id}`; assert `unit_price` and `total_amount` are unchanged
    - **Validates: Requirements 3.1, 3.10**

  - [ ]* 8.5 Write property test for insufficient stock atomicity (Property 5)
    - **Property 5: Insufficient Stock Atomicity**
    - Generate an order where at least one item's quantity exceeds the product's stock; POST to `/orders`; assert HTTP 400; assert all product quantities are unchanged; assert no order was created (order count unchanged)
    - **Validates: Requirements 3.2**

- [x] 9. Implement dashboard service and routes
  - [x] 9.1 Implement dashboard service
    - Write `backend/app/services/dashboard_service.py` with:
      - `get_dashboard(db)`: execute four async queries:
        1. `SELECT COUNT(*) FROM products`
        2. `SELECT COUNT(*) FROM customers`
        3. `SELECT COUNT(*) FROM orders`
        4. `SELECT id, name, sku, quantity FROM products WHERE quantity > 0 AND quantity <= 10 ORDER BY quantity ASC LIMIT 100`
      - Wrap all queries in `try/except SQLAlchemyError` → raise `HTTPException(503)` with message "Service temporarily unavailable"
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 9.2 Implement dashboard route
    - Write `backend/app/routes/dashboard.py` with an `APIRouter(prefix="/dashboard")`:
      - `GET /` → `get_dashboard` → 200 `DashboardResponse`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 9.3 Write property test for dashboard counts and low-stock consistency (Property 9)
    - **Property 9: Dashboard Counts and Low-Stock Consistency**
    - Generate a random number of products (with varying quantities), customers, and orders; `GET /dashboard`; assert `total_products`, `total_customers`, `total_orders` match actual row counts; assert every item in `low_stock_products` has `0 < quantity <= 10` and no qualifying product is absent (up to 100-item cap)
    - **Validates: Requirements 4.1, 4.2**

- [x] 10. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement frontend API client and shared components
  - [x] 11.1 Implement the fetch API client wrapper
    - Write `frontend/src/api/client.js`:
      - Export `BASE_URL = "http://localhost:8000"`
      - Export `async function apiFetch(path, options = {})` that sets `Content-Type: application/json`, calls `fetch`, checks `response.ok`, parses JSON error body on failure and throws `new Error(data.detail || "Unknown error")`, returns parsed JSON on success
    - _Requirements: 5.6, 6.5, 7.5_

  - [x] 11.2 Implement shared UI components
    - Write `frontend/src/components/NavBar.jsx`: renders navigation links for Dashboard, Products, Customers, Orders; accepts `currentPage` and `onNavigate` props
    - Write `frontend/src/components/LoadingSpinner.jsx`: renders a centered spinner element with an accessible `aria-label="Loading"`
    - Write `frontend/src/components/ErrorMessage.jsx`: accepts `message` and `onDismiss` props; renders a dismissible error banner; calls `onDismiss` when the dismiss button is clicked
    - _Requirements: 5.6, 6.1, 6.5, 7.5, 8.2, 8.3_

- [x] 12. Implement frontend product page and form components
  - [x] 12.1 Implement ProductForm component
    - Write `frontend/src/components/ProductForm.jsx`: controlled form with fields for name, SKU, price, quantity; accepts `initialValues`, `onSubmit`, `onCancel` props; validates name (1–200), SKU (1–100), price (≥ 0.01), quantity (≥ 0) client-side before calling `onSubmit`
    - _Requirements: 5.3, 5.4_

  - [x] 12.2 Implement ProductsPage
    - Write `frontend/src/pages/ProductsPage.jsx`:
      - On mount: `GET /products`, show `LoadingSpinner` while in flight, populate list, show `ErrorMessage` on failure
      - Render table with columns: name, SKU, price, quantity, actions (Edit, Delete)
      - Add Product: show `ProductForm` in add mode; on submit `POST /products`; on 201 refresh list; on error show `ErrorMessage`
      - Edit Product: show `ProductForm` pre-filled; on submit `PUT /products/{id}`; on 200 refresh list; on error show `ErrorMessage`
      - Delete Product: on confirm `DELETE /products/{id}`; on 204 remove from list; on error show `ErrorMessage`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 13. Implement frontend customer page and form components
  - [x] 13.1 Implement CustomerForm component
    - Write `frontend/src/components/CustomerForm.jsx`: controlled form with fields for full_name, email, phone; validates full_name (1–100), email format, phone (7–15 digits) client-side and displays field-level errors before any API call; accepts `onSubmit`, `onCancel` props
    - _Requirements: 6.3_

  - [x] 13.2 Implement CustomersPage
    - Write `frontend/src/pages/CustomersPage.jsx`:
      - On mount: `GET /customers`, show `LoadingSpinner` while in flight, populate list, show `ErrorMessage` on failure
      - Render table with columns: full_name, email, phone, actions (Delete)
      - Add Customer: show `CustomerForm`; on submit `POST /customers`; on 201 refresh list; on error show `ErrorMessage`
      - Delete Customer: on confirm `DELETE /customers/{id}`; on 204 remove from list; on error show `ErrorMessage`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 14. Implement frontend order page and form components
  - [x] 14.1 Implement OrderForm component
    - Write `frontend/src/components/OrderForm.jsx`: accepts `customers` and `products` lists as props; renders a customer dropdown and a dynamic list of order items (each with a product dropdown and quantity input ≥ 1); allows adding/removing items; validates at least one item before calling `onSubmit`
    - _Requirements: 7.2_

  - [x] 14.2 Implement OrderDetail component
    - Write `frontend/src/components/OrderDetail.jsx`: accepts an `order` object (with `items` array) and a `products` map; renders order id, customer name, total_amount, created_at, and a table of line items with product name, quantity, unit_price; accepts `onClose` prop
    - _Requirements: 7.3_

  - [x] 14.3 Implement OrdersPage
    - Write `frontend/src/pages/OrdersPage.jsx`:
      - On mount: `GET /orders`, `GET /customers`, `GET /products` in parallel; show `LoadingSpinner`; populate orders list resolving customer full_name from customer_id; show `ErrorMessage` on failure
      - Render table with columns: order id, customer full_name, total_amount, created_at, actions (View, Delete)
      - Create Order: show `OrderForm`; on submit `POST /orders`; on 201 refresh list; on error show `ErrorMessage`
      - View Order: `GET /orders/{id}`; show `OrderDetail`; on error show `ErrorMessage`
      - Delete Order: on confirm `DELETE /orders/{id}`; on 204 remove from list; on error show `ErrorMessage`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15. Implement frontend dashboard page
  - [x] 15.1 Implement DashboardPage
    - Write `frontend/src/pages/DashboardPage.jsx`:
      - On mount: show `LoadingSpinner`; `GET /dashboard`; on success populate four summary cards (Total Products, Total Customers, Total Orders, Low Stock Products count) and hide spinner; if `low_stock_products` count > 0 render names of up to 10 items below the cards; on failure hide spinner and show `ErrorMessage`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 16. Wire up App.jsx with state-based routing
  - [x] 16.1 Implement App.jsx root component
    - Write `frontend/src/App.jsx`:
      - Hold `currentPage` state (default `"dashboard"`)
      - Render `<NavBar currentPage={currentPage} onNavigate={setCurrentPage} />`
      - Conditionally render `<DashboardPage />`, `<ProductsPage />`, `<CustomersPage />`, or `<OrdersPage />` based on `currentPage`
    - _Requirements: 5.1, 6.1, 7.1, 8.1_

- [ ] 17. Implement frontend property-based and component tests
  - [ ]* 17.1 Write property test for frontend error display persistence (Property 10)
    - **Property 10: Frontend Error Display Persistence**
    - Using Vitest + `@testing-library/react`: mock `fetch` via `vi.stubGlobal` to return various error status codes (400, 404, 409, 422, 500) with `{"detail": "..."}` body; render `ProductsPage`, `CustomersPage`, and `OrdersPage`; assert error message is displayed containing the detail text; assert it remains visible before dismiss button is clicked; assert it disappears after clicking dismiss
    - **Validates: Requirements 5.6, 6.5, 7.5**

  - [ ]* 17.2 Write component tests for loading indicators
    - Test that `DashboardPage`, `ProductsPage`, `CustomersPage`, and `OrdersPage` each render `LoadingSpinner` while the fetch is in flight (mock fetch to never resolve during the assertion)
    - _Requirements: 6.1, 8.2_

  - [ ]* 17.3 Write component tests for client-side form validation
    - Test that `CustomerForm` displays field-level validation errors for empty full_name, invalid email, and phone outside 7–15 digits without making any API call
    - _Requirements: 6.3_

- [ ] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery
- Each task references specific requirements for full traceability
- Property tests use Hypothesis (`@given`) for backend (Properties 1–9) and Vitest mocks for frontend (Property 10)
- The `SELECT ... FOR UPDATE` in `create_order` is critical for concurrent stock safety — do not remove it
- `aiosqlite` is used as the in-memory async database for unit/service tests; route tests use `httpx.AsyncClient`
- All error responses follow the `{"detail": "..."}` envelope; the frontend always reads `.detail`
- Docker Compose `depends_on: service_healthy` ensures the backend never starts before PostgreSQL is ready

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["5.1", "6.1", "8.1", "9.1"] },
    { "id": 5, "tasks": ["5.2", "6.2", "8.2", "9.2"] },
    { "id": 6, "tasks": ["5.3", "5.4", "6.3", "6.4", "6.5", "8.3", "8.4", "8.5", "9.3"] },
    { "id": 7, "tasks": ["11.1", "11.2"] },
    { "id": 8, "tasks": ["12.1", "13.1", "14.1", "14.2", "15.1"] },
    { "id": 9, "tasks": ["12.2", "13.2", "14.3"] },
    { "id": 10, "tasks": ["16.1"] },
    { "id": 11, "tasks": ["17.1", "17.2", "17.3"] }
  ]
}
```

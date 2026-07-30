# Retail Inventory Management System

A backend system for managing inventory, sales, and purchases for a stationery shop, built with Java, Spring Boot, and MySQL. I built this to make a resume claim genuinely true — every feature here is real, tested, and something I can walk through in detail.

## What it does

- Manage product categories, products, and suppliers
- Record sales — automatically validates and reduces stock
- Record purchases — automatically increases stock
- Analytics: revenue summary, top-selling products, low-stock alerts, and a dashboard combining all key stats
- Search and filter products by category or name, with pagination and sorting
- Secured with JWT authentication — all endpoints require a valid token except login
- Interactive API documentation via Swagger UI

## Tech stack

- Java 17, Spring Boot
- Spring Data JPA + Hibernate
- MySQL
- Spring Security + JWT
- JUnit 5 + Mockito (unit tests)
- springdoc-openapi (Swagger UI)

## Architecture

Follows a layered Controller → Service → Repository pattern throughout. Business logic (like stock validation on sales, or stock increases on purchases) lives in the Service layer, wrapped in `@Transactional` where multiple related writes happen together (e.g. a Sale reducing a Product's stock) — so if one part fails, both roll back together.

API responses use DTOs (not raw entities) for Product, Sale, and Purchase, since those have relationships worth flattening for cleaner JSON. Category and Supplier return entities directly, since they have no relationships to hide.

## Running it locally

1. Create a MySQL database named `retail_inventory_db`
2. Set your DB password as an environment variable `DB_PASSWORD` in your run configuration
3. Run `RetailInventorySystemApplication`
4. API docs available at `http://localhost:8080/swagger-ui/index.html`
5. Default login: `admin` / `admin123` (seeded automatically on first run)

## Honest notes / things I'd improve with more time

- Uses `spring.jpa.hibernate.ddl-auto=update` rather than a proper migration tool like Flyway — fine for a learning project, not what I'd use in production
- No role-based access control yet — every logged-in user has full access; a real system would separate admin vs staff permissions
- Test coverage is solid on the trickier business logic (stock validation) but not exhaustive across every method
- Auto-incrementing IDs don't reset after deletion (a MySQL default behavior) — occasionally makes manual testing confusing but doesn't affect actual functionality

## What I learned building this

This was my first time implementing JWT authentication from scratch, understanding foreign key relationships in JPA (`@ManyToOne`), and structuring a project with a proper Service layer instead of calling repositories directly from controllers. Debugging real errors (mismatched exception handlers, missing fields, pagination interactions) taught me more than the parts that worked on the first try.
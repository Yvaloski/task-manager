# Project: Task Manager

## Architecture
This project is structured as a monorepo consisting of:
- **backend**: Spring Boot application (Java 21, Maven, H2 in-memory DB) exposing a REST API. Runs on port `8080`.
- **frontend**: Angular application using Tailwind CSS for a modern dashboard and task management interface. Runs on port `4200`.

Data flows from the frontend client via HTTP requests to the backend REST API, which persists/retrieves data from the in-memory H2 database.

### Directory Layout
```
task-manager/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/taskmanager/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── ...
│   ├── package.json
│   ├── tailwind.config.js
│   └── ...
```

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Testing Track | Design and build E2E test suite (Tiers 1-4) | None | IN_PROGRESS |
| 2 | Backend API | REST API entities, CRUD endpoints, database prepopulation, CORS configuration, and unit tests | None | DONE |
| 3 | Frontend Client | Angular app structure, Tailwind configuration, services, components, priority indicators, forms, and unit tests | None | IN_PROGRESS |
| 4 | Final E2E Integration | E2E test verification, bug fixing, and white-box adversarial hardening (Tier 5) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Client (Frontend) ↔ Server (Backend)
All API requests use `http://localhost:8080`. CORS is configured to allow `http://localhost:4200`.

#### Category Entity JSON Schema
```json
{
  "id": 1,
  "name": "Work",
  "description": "Professional tasks"
}
```

#### Task Entity JSON Schema
```json
{
  "id": 1,
  "title": "Setup repository",
  "description": "Initialize Maven and Angular structures",
  "creationDate": "2026-07-17",
  "dueDate": "2026-07-20",
  "status": "A_FAIRE",
  "priority": "HAUTE",
  "category": {
    "id": 1,
    "name": "Work",
    "description": "Professional tasks"
  }
}
```

#### Endpoints
##### Category REST CRUD
- `GET /api/categories` - Returns array of Categories (200 OK)
- `GET /api/categories/{id}` - Returns Category or 404 (200 OK, 404 Not Found)
- `POST /api/categories` - Accepts Category (no ID), returns Category (201 Created)
- `PUT /api/categories/{id}` - Accepts Category, returns updated Category (200 OK, 404 Not Found)
- `DELETE /api/categories/{id}` - Deletes Category (204 No Content, 404 Not Found)

##### Task REST CRUD
- `GET /api/tasks` - Returns array of Tasks. Optional filters as query parameters: `status` (A_FAIRE/EN_COURS/TERMINE), `priority` (BASSE/MOYENNE/HAUTE), `categoryId` (number) (200 OK)
- `GET /api/tasks/{id}` - Returns Task or 404 (200 OK, 404 Not Found)
- `POST /api/tasks` - Accepts Task (no ID), returns Task (201 Created)
- `PUT /api/tasks/{id}` - Accepts Task, returns updated Task (200 OK, 404 Not Found)
- `DELETE /api/tasks/{id}` - Deletes Task (204 No Content, 404 Not Found)

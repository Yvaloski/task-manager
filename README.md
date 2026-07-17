# Task Manager — Spring Boot + Angular

Application de gestion de tâches moderne avec un backend Java REST et un frontend Angular.

## 🏗️ Architecture

```
task-manager/
├── backend/      # API REST Spring Boot (Java 21, Maven, H2)
└── frontend/     # Client Angular 17 + Tailwind CSS
```

## ✨ Fonctionnalités

- **CRUD complet** sur les tâches et les catégories
- **Filtres dynamiques** par statut, priorité et catégorie
- **Indicateurs visuels** : codes couleur pour les priorités, alertes retard
- **Données pré-chargées** : 3 catégories et 5 tâches d'exemple au démarrage
- **Relation Many-to-One** entre Tâches et Catégories (JPA)

## 🚀 Démarrage rapide

### Backend (port 8080)
```bash
cd backend
mvn spring-boot:run
```

### Frontend (port 4200)
```bash
cd frontend
npm install
npm start
```

Ouvrez [http://localhost:4200](http://localhost:4200)

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Java 21, Spring Boot 3, Maven |
| Base de données | H2 (en mémoire) |
| API | REST (JSON), CORS activé |
| Frontend | Angular 17, TypeScript |
| Style | Tailwind CSS |

## 📋 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks` | Liste des tâches (filtrable) |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/{id}` | Modifier une tâche |
| DELETE | `/api/tasks/{id}` | Supprimer une tâche |
| GET | `/api/categories` | Liste des catégories |
| POST | `/api/categories` | Créer une catégorie |
| DELETE | `/api/categories/{id}` | Supprimer une catégorie |

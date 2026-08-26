# Library Management System – Frontend

# 👤 Student Information

- **Student Name:** Dinan ThemikA  
- **Student Number:** 241722003  
- **Slack Handle:** *(Not provided)*  
- **GCP Project ID:** graceful-system-415016

  
A web-based **Library Management System frontend** built with **React, TypeScript, and Axios**. The application provides interfaces for managing users, books, and borrowing/return records through a backend REST API.

Web App URL ::   http://136.112.242.162/dashboard

## Features

### 👥 User Management

* View all library users
* Search users by name
* Add new users
* Update existing users
* Delete users
* Assign `MEMBER` or `ADMIN` roles
* Store birthday and phone number
* Upload user profile photos or ID documents
* Preview uploaded images
* User initials fallback when an image is unavailable

The user interface validates names, email addresses, and passwords before submitting user data.

### 📚 Book Management

* View all books
* Search books by title
* Add new books
* Update book information
* Delete books
* Increase book stock
* Display book availability state
* Validate book names, authors, and stock values

Supported book states include:

* `AVAILABLE`
* `BORROWED`
* `UPDATED`

### 📖 Borrowing & Return Records

* View borrowing records
* Search records by user ID
* Add borrowing records
* Update records
* Delete records
* Mark books as returned
* Display borrowed and returned dates
* Select users and books from dropdown lists
* Display record states

Supported record states include:

* `BORROWED`
* `RETURNED`
* `UPDATED`

## Tech Stack

| Technology | Purpose                |
| ---------- | ---------------------- |
| React      | Frontend UI            |
| TypeScript | Type-safe development  |
| Axios      | REST API communication |
| CSS        | Application styling    |
| HTML       | UI structure           |

## Project Structure

```text
src/
├── components/
│   ├── BookSection.tsx
│   ├── RecordSection.tsx
│   └── UserSection.tsx
│
├── service/
│   └── api.ts
│
├── styles/
│   ├── library.css
│   └── record.css
│
└── ...
```

> The exact component folder names may differ depending on the project's current directory structure.

## API Integration

The frontend communicates with the backend using an Axios client.

```typescript
export const api = axios.create({
  baseURL: "http://35.192.21.137:80",
});
```

### User API

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| GET    | `/api/users`                | Get all users     |
| GET    | `/api/users/count`          | Get user count    |
| POST   | `/api/users`                | Add a user        |
| PUT    | `/api/users/{id}`           | Update a user     |
| DELETE | `/api/users/{id}`           | Delete a user     |
| POST   | `/api/users/upload`         | Upload user image |
| GET    | `/api/users/stream/{image}` | Stream user image |

The frontend uses the user API for CRUD operations and image uploads.

### Book API

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/api/books`            | Get all books     |
| GET    | `/api/books/count`      | Get book count    |
| POST   | `/api/books`            | Add a book        |
| PUT    | `/api/books/{id}`       | Update a book     |
| DELETE | `/api/books/{id}`       | Delete a book     |
| PATCH  | `/api/books/{id}/stock` | Update book stock |

### Record API

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| GET    | `/api/records`             | Get all borrowing records |
| GET    | `/api/records/count`       | Get record count          |
| POST   | `/api/records`             | Add a borrowing record    |
| PUT    | `/api/records/{id}`        | Update a record           |
| DELETE | `/api/records/{id}`        | Delete a record           |
| PATCH  | `/api/records/{id}/return` | Mark a record as returned |

## Data Models

### User

```typescript
interface User {
  id: string;
  name: string;
  birthday: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  image: string;
}
```

### Book

```typescript
interface Book {
  id: string;
  name: string;
  author: string;
  stock: number;
  state: string;
}
```

### Record

```typescript
interface Record {
  id: string;
  userId: string;
  bookId: string;
  borrowedDate: Date;
  returnedDate?: Date;
  state: string;
}
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## Build for Production

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Application Workflow

```text
                ┌─────────────────────┐
                │      React UI       │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    Axios API Client │
                └──────────┬──────────┘
                           │
             HTTP REST API│
                           ▼
                ┌─────────────────────┐
                │    Backend API      │
                └──────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        User Service   Book Service   Record Service
```

## Main Modules

### Users

The Users module manages library members and administrators. Users can be created, edited, searched, and deleted. Profile photos or ID documents can also be uploaded and displayed.

### Books

The Books module provides catalog management. Administrators can add books, modify book information, delete books, and increase available stock.

### Records

The Records module manages book circulation. A borrowing record connects a user with a book and stores borrowing and return information. Records can also be marked as returned directly from the interface.

## Validation

The frontend includes basic validation such as:

* User name and email are required

* Email must have a valid format

* New users require a password

* Book name and author are required

* Book stock cannot be negative

* Borrowing records require both a user and a book

## Error Handling

API errors are handled using promise `catch` blocks. Failed operations are logged to the browser console and user-friendly alert messages are displayed where appropriate.

Example:

```typescript
.catch((err) => {
  console.error("Delete book failed:", err?.response?.data ?? err);
});
```

## Search

The application provides client-side search functionality.

### Books

Books are filtered by book name/title.

### Users

Users are filtered by user name.

### Records

Borrowing records are filtered by user ID.

## Backend Requirement

This frontend requires the corresponding Library Management System backend to be running and accessible through the configured Axios `baseURL`.

If the backend address changes, update:

```typescript
export const api = axios.create({
  baseURL: "YOUR_BACKEND_URL",
});
```

in:

```text
src/service/api.ts
```

## Notes

* The current API client uses an HTTP backend endpoint.
* User images are uploaded separately before the user record is saved.
* Book stock can be increased directly from the Books interface.
* Returned records cannot be marked as returned again.
* When editing a user, leaving the password field empty keeps the existing password unchanged.

## License

This project is developed for educational and project purposes.

# RedecellRJ POS System

Welcome to the RedecellRJ Point of Sale (POS) system! This project aims to provide a robust, visually appealing, and highly functional solution for managing sales, products, and customers in a retail environment.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Development](#development)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication & Authorization:** Secure login, registration, and role-based access control.
- **Product Management:** Comprehensive CRUD operations for products and their variations.
- **Sales & POS:** Intuitive point-of-sale interface for efficient transaction processing.
- **Customer Management:** Manage customer information.
- **Dashboard & Reporting:** Visual insights into sales data and top-selling products.
- **Robust Design System:** Consistent UI/UX with theming capabilities.
- **Automated CI/CD:** Streamlined development and deployment workflows.

## Architecture

The application follows a modular, full-stack architecture:

- **Backend:** Node.js with Express.js, TypeScript, and PostgreSQL.
- **Frontend:** React with TypeScript, React Router, and a custom Design System.
- **Database:** PostgreSQL.
- **Testing:** Jest (unit/integration), Cypress (E2E), Chromatic (visual regression).
- **CI/CD:** GitHub Actions for automated testing, releases, and deployments.

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- PostgreSQL (v13 or higher)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/RedecellRJ.git
    cd RedecellRJ
    ```

2.  **Install Backend Dependencies:**
    ```bash
    npm install --prefix backend
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    npm install --prefix frontend
    ```

4.  **Database Setup:**
    - Ensure your PostgreSQL server is running.
    - Create a database named `pdv_web`.
    - Update the `.env.test` file in the `backend` directory with your PostgreSQL connection details.
      ```
      DB_HOST=localhost
      DB_PORT=5432
      DB_USER=postgres
      DB_PASSWORD=your_password
      JWT_SECRET=supersecretjwtkey # Change this in production!
      ```

5.  **Run Database Migrations & Seed Data:**
    The backend will automatically run migrations and seed initial data when it starts.

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    npm start --prefix backend
    ```
    The backend will run on `http://localhost:3000` (or your configured port).

2.  **Start the Frontend Development Server:**
    ```bash
    npm start --prefix frontend
    ```
    The frontend will run on `http://localhost:3001` (or your configured port).

    You can now access the application in your browser at `http://localhost:3001`.

## Development

### Backend

- **Run Tests:** `npm test --prefix backend`
- **Run Lint:** `npm run lint --prefix backend`
- **Build:** `npm run build --prefix backend`

### Frontend

- **Run Tests:** `npm test --prefix frontend`
- **Run Lint:** `npm run lint --prefix frontend`
- **Build:** `npm run build --prefix frontend`
- **Storybook:** `npm run storybook --prefix frontend`

### Database

- **Access PSQL:** `psql -U postgres -d pdv_web` (using your PostgreSQL password)

## Testing

- **Unit & Integration Tests (Backend):** `npm test --prefix backend`
- **Unit Tests (Frontend):** `npm test --prefix frontend`
- **End-to-End Tests (Cypress):** `npm run cypress:open --prefix frontend`
- **Visual Regression Tests (Chromatic):** Configured via GitHub Actions.

## Deployment

Deployment is automated via GitHub Actions:

- **Release Workflow:** Triggered on push to `main` branch. Automates versioning, tagging, and changelog generation.
- **Deploy Workflow:** Triggered on new GitHub Releases. Deploys frontend (e.g., Vercel) and backend (e.g., Heroku).

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License.
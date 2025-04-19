# NodeJS (ts) Microservices

**Tech stack**:

- Node.js
- TypeScript
- Turborepo
- MongoDB
- RabbitMQ
- Docker & Compose

**Services**:

- User service: HTTP CRUD API, AMQP publisher
- Notification service: AMQP consumer

## Setup

1. Install dependencies:  

   ```bash
   npm install
   ```

2. Create `.env` file in the root of both the *user-service* and *notification-service*, using each service's `.env.example` as a template.

3. Build the project:  

   ```bash
   npm run build
   ```

## Run

### Development

Starts the app in watch mode for live reload:

  ```bash
  npm run dev
  ```

### Docker Compose

  1. Build Docker images for both services:  

      ```bash
      npm run docker-build/user-service

      npm run docker-build/notification-service
      ```

  2. Start all containers:  

     ```bash
     npm run up
     ```  

     *(Runs `docker compose up`)*

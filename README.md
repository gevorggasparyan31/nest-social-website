# NestJS, PostgreSQL Social Website API

Social website API project with *NestJS*, *PostgreSQL* without ORMs.

## Project Structure

- **Repositories** manage the database accesses.
- **Controllers** handle HTTP requests and call corresponding services.
- **Services** handle the business logic.
- **Database** module is handling the DB connections.

- `auth/` – Authentication module with **JWT authentication** and **refresh token implementation**.
- `users/` – User management module.
- `friends/` – Friend request handling module.
- `database/` – Database connection module.

The project includes both **global** and **local** interfaces and constants:

Interfaces and constants:

- **Global**s are stored in folders (`interfaces/`, `constants/`).
- **Local**s are stored in (`auth/constants.ts`, `users/interfaces.ts`, ...).

## Steps to run the app

### 1. Create a `.env` file

Use the example from `.env.example` to create a `.env` file with necessary properties.

### 2. Set up the DB

Create an empty PostgreSQL database instance, before starting. 

#### Apply the migrations:

```sh
npm run migrate:up
```

#### Migration rollback:

```sh
npm run migrate:down
```

### 3. Run the app

```sh
npm run start
```

For development environment use:

```sh
npm run start:dev
```

API is available on:

```
http://127.0.0.1:<PORT>
```

API documentation URL:

```
http://127.0.0.1:<PORT>/api
```

## Run the unit tests

To run the unit tests run:

```bash
npm run test
```

### Tests Structure

**Authentication service tests**
- `src/auth/auth.service.spec.ts`
  - Login functionality
  - Registration process
  - Token refresh mechanism

**Auth token service tests**
- `src/auth/auth-tokens/auth-tokens.service.spec.ts`
  - Generate tokens
  - Save Refresh token
  - Validate refresh token
  - Delete refresh token

**Friends service tests**
- `src/friends/friends.service.spec.ts`
  - Friend request sending
  - Request management (accept/decline)
  - Friend list retrieval

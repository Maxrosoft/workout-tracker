# Workout Tracker

Workout Tracker is a fitness tracking application that allows users to sign up, log in, create workouts, and manage exercises, schedules, and comments.

## Features

- **User Authentication:** Sign up, log in, and log out with JWT-based authentication.
- **Workout Management:** Create, update, and delete workouts.
- **Exercise Management:** Add exercises to workouts with details such as number of sets, repetitions, and targeted muscle groups.
- **Scheduling:** Set schedules for workouts.
- **Commenting:** Add comments to workouts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- [PostgreSQL](https://www.postgresql.org/) database

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Maxrosoft/workout-tracker.git
   cd workout-tracker
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   PORT=
   TOKEN_SECRET=
   PASSWORD_SECRET=
   POSTGRES_URL=
   ADMIN_PASSWORD=
   ```

4. **Set Up the Database:**

   - Ensure your PostgreSQL server is running.
   - Create a database named `workout-tracker-db`.

5. **Start the Server:**

   - For production:
     ```bash
     npm start
     ```
   - For development (with hot reloading if configured):
     ```bash
     npm run dev
     ```

   The server should now be running on [http://localhost:3000](http://localhost:3000).

## API Endpoints

### Authentication

- **POST `/signup`**
  - **Description:** Create a new user account and receive an access token.
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "password": "YourPassword123"
    }
    ```
  - **Response:**
    ```json
    {
      "type": "success",
      "message": "User signed up successfully",
      "data": {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "token": "JWT_TOKEN_HERE"
      },
      "code": 201
    }
    ```

- **POST `/login`**
  - **Description:** Authenticate an existing user and receive an access token.
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "YourPassword123"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "User logged in successfully",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "token": "JWT_TOKEN_HERE"
      }
    }
    ```

### Additional Endpoints

Refer to the source code in the `src/routes` directory for details on additional endpoints related to workouts, exercises, schedules, and comments.

## Technologies Used

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT (JSON Web Tokens) for authentication
- Bcrypt for password hashing

## Contributing

Contributions are welcome! Please submit issues or pull requests for improvements.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or suggestions, please open an issue in the [GitHub repository](https://github.com/Maxrosoft/workout-tracker).

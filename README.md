# Agricultural Control System

This project is an Agricultural Control System designed to help producers manage their livestock and farm information efficiently. The system allows users to register unique seals or brands for their livestock and maintain detailed records about their farms.

## Features

- User authentication with login and registration functionality.
- Ability to create, retrieve, and update farm information.
- Capability to register, retrieve, and update livestock details.
- Secure access to routes using authentication middleware.

## Project Structure

```
agricultural-control-system
├── src
│   ├── controllers
│   │   ├── authController.js
│   │   ├── farmController.js
│   │   └── livestockController.js
│   ├── models
│   │   ├── user.js
│   │   ├── farm.js
│   │   └── livestock.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── farmRoutes.js
│   │   └── livestockRoutes.js
│   ├── config
│   │   └── db.js
│   ├── middleware
│   │   └── authMiddleware.js
│   └── app.js
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd agricultural-control-system
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```
2. Access the application at `http://localhost:3000`.

## Database Configuration

This project uses MySQL as the database. Ensure that you have a MySQL server running and update the database connection details in `src/config/db.js`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
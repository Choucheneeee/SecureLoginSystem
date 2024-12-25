# SecureLoginSystem

SecureLoginSystem is an API project designed for Node.js-based authentication and user verification system. It provides endpoints for user registration, login, email verification, session management, and a protected route to demonstrate session-based authentication.

## Features

- User Registration with email verification
- Secure login using hashed passwords
- Session-based authentication
- Middleware to protect routes
- Logout functionality

## Installation

### Prerequisites
- Node.js installed
- MongoDB database
- A Gmail account with **2-step verification enabled** (see below for instructions).

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/SecureLoginSystem.git
    cd SecureLoginSystem
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following variables:
    ```env
    url=mongodb://localhost:27017/YourDatabaseName
    key=your-secure-key-here
    ALPHA=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
    EMAIL_USER=your-email@example.com
    EMAIL_PASS=your-email-password
    ```

    ### Setting Up Gmail for Email Sending
    To use your Gmail account for sending emails with Nodemailer:
    1. Enable **2-step verification** in your Gmail account settings. [Learn how](https://support.google.com/accounts/answer/185839?hl=en).
    2. Create an **App Password** in your Gmail account. Use this password as `EMAIL_PASS` in your `.env` file.

4. Start the application:
    ```bash
    npm start
    ```

5. The API will run at `http://localhost:3000`.

## API Endpoints

### 1. **User Registration**
- **POST** `/register`
- **Request Body**:
    ```json
    {
        "username": "John Doe",
        "email": "john@example.com",
        "password": "securePassword",
        "cpassword": "securePassword",
        "phone": "1234567890"
    }
    ```
    - **Note**: Ensure `password` and `cpassword` match.
- **Response**:
    ```json
    {
        "message": "User registered successfully. Please check your email for the verification code."
    }
    ```

### 2. **Email Verification**
- **POST** `/verif`
- **Request Body**:
    ```json
    {
        "email": "john@example.com",
        "code": "verification-code"
    }
    ```
- **Response**:
    ```json
    {
        "message": "Email verified successfully."
    }
    ```

### 3. **User Login**
- **POST** `/login`
- **Request Body**:
    ```json
    {
        "email": "john@example.com",
        "password": "securePassword"
    }
    ```
- **Response**:
    ```json
    {
        "message": "Login successful",
        "user": {
            "_id": "user-id",
            "username": "John Doe",
            "email": "john@example.com"
        }
    }
    ```

### 5. **Protected Route**
- **GET** `/home`
- **Headers**: Include session cookies for authentication.
- **Response** (If logged in and the user has verified their account):
    ```json
    {
        "message": "You are logged in, welcome home!"
    }
    ```

### Error Handling
- All errors return a JSON response:
    ```json
    {
        "error": "Error message here."
    }
    ```

## Project Structure
```
SecureLoginSystem/
├── models/
│   ├── users.models.js       # User model and related functions
├── routes/
│   ├── users.routes.js       # Routes for user-related actions
│   ├── guard.auth.js         # Middleware for authentication and verification
├── .env                      # Environment variables
├── app.js                    # Main application entry point
├── package.json              # Project metadata and dependencies
└── README.md                 # Documentation
```

## Built With

- [Node.js](https://nodejs.org/): JavaScript runtime
- [Express](https://expressjs.com/): Web framework for Node.js
- [Mongoose](https://mongoosejs.com/): MongoDB object modeling
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js): Password hashing
- [Nodemailer](https://nodemailer.com/): Email sending

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [MongoDB](https://www.mongodb.com/)
- [Postman](https://www.postman.com/) for API testing
- [dotenv](https://github.com/motdotla/dotenv) for environment variable management

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

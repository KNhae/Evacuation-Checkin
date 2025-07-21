# Evacuation-Checkin

## Overview

The `Evacuation-Checkin` project is a web-based application designed to streamline the process of tracking individuals during evacuation scenarios. It ensures that all employees or participants are accounted for efficiently and securely.

This application allows users to check in and confirm their presence with minimal effort. It is equipped with features for real-time status updates, secure data handling, and responsive design for accessibility across devices.

## Features

- **Check-In Functionality**: Users can input their employee number to log their presence.
- **Confirmation Page**: Displays confirmation of the check-in, along with user details such as name and department.
- **Secure Data Handling**: Employee numbers and sensitive data are securely transmitted and stored.
- **Responsive Design**: The application is mobile-friendly and adapts to various screen sizes.
- **Error Handling**: Provides user-friendly messages for invalid inputs or system errors.
- **Real-Time Status**: Backend API integration for real-time updates on the system status.

## Technology Stack

- **Backend**: Node.js with Express.js framework
- **Frontend**: HTML with EJS templates and CSS for styling
- **API Integration**: Axios for making secure API calls
- **Database**: Presumably uses a connection pool for database interactions
- **Styling**: Custom CSS with a focus on modern, aesthetic design
- **Security**: HTTPS with token-based authentication for API calls

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KNhae/Evacuation-Checkin.git
   cd Evacuation-Checkin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     API_SERVER=<API Web Server URL>
     API_USERNAME=<Your API Username>
     API_PASSWORD=<Your API Password>
     ```

4. Start the application:
   ```bash
   npm start
   ```

5. Access the application in your browser at `http://localhost:<PORT>` (default port is 3000).

## Usage

1. Navigate to the application URL.
2. Enter your employee number in the provided input field on the Check-In page.
3. Review the details on the Confirmation page.
4. Confirm your check-in.

## API Endpoints

- **`GET /api/status`**: Returns the system status, including database connection state and API server information.
- **`POST /confirm`**: Handles check-in confirmation with employee details.

## Project Structure

```
├── app.js                 # Main application file
├── views                  # EJS templates for frontend
│   ├── checkin.ejs        # Check-In page
│   ├── confirm.ejs        # Confirmation page
├── public                 # Static assets (CSS, JS, images)
├── routes                 # Application routes (if applicable)
├── .env                   # Environment variables (not included in repo)
├── package.json           # Dependencies and scripts
```
<!--
## Screenshots

![Check-In Page](./path-to-checkin-screenshot.png)
![Confirmation Page](./path-to-confirmation-screenshot.png)
-->

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Contributors and maintainers of the project.
- Open-source libraries and tools used in the development of this application.

---

Feel free to reach out if you encounter any issues or have suggestions for improvement.

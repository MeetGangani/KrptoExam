# Online Examination System

A secure and efficient MERN stack application for conducting online examinations with IPFS-based question storage and encryption.

## Features

- **User Management**
  - Multi-role authentication (Admin, Institute, Student)
  - Secure password handling
  - Role-based access control

- **Exam Management**
  - Create and upload exam questions in JSON format
  - Automatic encryption of exam data
  - IPFS-based secure storage
  - Time-limited examinations
  - Real-time exam progress tracking

- **Student Features**
  - Access exams using IPFS hash
  - Real-time countdown timer
  - Question navigation
  - Auto-submit on time completion
  - View exam results and history

- **Institute Features**
  - Upload and manage exam papers
  - Monitor exam submissions
  - Release results to students
  - View detailed exam statistics

- **Admin Features**
  - User management
  - Approve/reject exam uploads
  - System monitoring
  - Create users with different roles

## Tech Stack

- **Frontend**
  - React.js
  - Redux Toolkit
  - React Bootstrap
  - Axios

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication

- **Storage**
  - IPFS (InterPlanetary File System)
  - Pinata IPFS Service

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB
- npm or yarn
- Pinata IPFS Account


## API Endpoints

### Auth Routes
- `POST /api/users` - Register user
- `POST /api/users/auth` - Authenticate user
- `POST /api/users/logout` - Logout user

### Exam Routes
- `GET /api/exams/available` - Get available exams
- `POST /api/exams/start` - Start exam
- `POST /api/exams/submit` - Submit exam
- `GET /api/exams/my-results` - Get user results

### Admin Routes
- `GET /api/admin/requests` - Get exam requests
- `PUT /api/admin/requests/:id` - Update request status

### Institute Routes
- `POST /api/upload` - Upload exam file
- `GET /api/upload/my-uploads` - Get institute uploads

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- React Bootstrap for UI components
- IPFS for decentralized storage
- MongoDB for database
- Express.js for backend framework

## Contact

Your Name - [@MeetGangani](https://www.linkedin.com/in/meet-gangani-166750254/) - meetgangani56@gmail.com

Project Link: [https://github.com/MeetGangani/KryptoExam](https://github.com/MeetGangani/KryptoExam)

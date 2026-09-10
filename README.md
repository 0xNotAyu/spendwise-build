# SpendWise - AI-Powered Personal Finance Platform

A production-quality, responsive web app for personal finance management with AI-driven insights.

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- TanStack Query for data fetching
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls

### Backend
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
spendwise/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   ├── public/
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── config/        # Configuration
│   │   └── index.ts       # Server entry point
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

3. Set up environment variables:
```bash
# Server (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spendwise
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000

# Client (.env)
VITE_API_URL=http://localhost:5000
```

4. Start MongoDB

5. Run the development servers:
```bash
# Backend (in server directory)
npm run dev

# Frontend (in client directory)
npm run dev
```

The frontend will be available at http://localhost:3000
The backend API will be available at http://localhost:5000

## MVP Features

- ✅ User authentication (register, login, logout)
- ✅ User profile management
- ✅ Income and expense tracking
- ✅ Custom categories
- ✅ Budget management with alerts
- ✅ Dashboard with visualizations
- ✅ Basic analytics

## Post-MVP Features

- AI-powered financial assistant
- Natural language expense entry
- Receipt scanning
- Savings goals
- Recurring expenses
- Group expense splitting
- Advanced analytics and predictions

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### User Endpoints
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- PUT /api/users/password - Change password

### Transaction Endpoints
- GET /api/transactions - Get all transactions (with pagination, filtering)
- POST /api/transactions - Create new transaction
- GET /api/transactions/:id - Get single transaction
- PUT /api/transactions/:id - Update transaction
- DELETE /api/transactions/:id - Delete transaction

### Category Endpoints
- GET /api/categories - Get all categories
- POST /api/categories - Create new category
- PUT /api/categories/:id - Update category
- DELETE /api/categories/:id - Delete category

### Budget Endpoints
- GET /api/budgets - Get all budgets
- POST /api/budgets - Create new budget
- PUT /api/budgets/:id - Update budget
- DELETE /api/budgets/:id - Delete budget

### Analytics Endpoints
- GET /api/analytics/summary - Get financial summary
- GET /api/analytics/monthly - Get monthly analytics
- GET /api/analytics/categories - Get category breakdown

## Development Status

Current milestone: M0 - Project setup ✅

## License

ISC

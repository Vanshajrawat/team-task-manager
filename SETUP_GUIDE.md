# 🎯 Team Task Manager - Complete Setup Guide

Congratulations! Your complete MERN stack Team Task Manager application has been created. Follow these steps to get started.

## ✅ What's Been Created

### Backend (Node.js + Express + MongoDB)
- ✅ User authentication (Register/Login with JWT)
- ✅ Project management APIs
- ✅ Task management APIs
- ✅ Role-based access control
- ✅ MongoDB models (User, Project, Task)
- ✅ Complete error handling and validation

### Frontend (React)
- ✅ Authentication pages (Login/Register)
- ✅ Dashboard with project list
- ✅ Project management interface
- ✅ Task management interface
- ✅ Dashboard statistics
- ✅ Responsive design with CSS

### Documentation
- ✅ Comprehensive README.md
- ✅ Quick start guide (QUICKSTART.md)
- ✅ Deployment guide (Railway)
- ✅ API endpoint documentation
- ✅ Database schema documentation

## 🚀 Quick Start (Choose One)

### Option 1: Windows Users
```bash
# Run the setup script
setup.bat

# Then run the application
npm run dev
```

### Option 2: Mac/Linux Users
```bash
# Make script executable
chmod +x setup.sh

# Run the setup script
./setup.sh

# Then run the application
npm run dev
```

### Option 3: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret
npm run dev
```

#### Frontend Setup (in another terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## 📋 Step-by-Step Setup

### 1. Install Node.js and MongoDB

**Windows/Mac/Linux:**
- Download Node.js from: https://nodejs.org/
- Install MongoDB from: https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Configure Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# Mac/Linux
brew services start mongodb-community
```

**MongoDB Atlas:**
- Create a cluster on MongoDB Atlas
- Update the MONGODB_URI in backend/.env with your connection string

### 5. Run the Application

**Option A: Run Both Together**
```bash
npm run dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## 🧪 Test the Application

### 1. Open Browser
```
http://localhost:3000
```

### 2. Register a New Account
- Click "Register"
- Enter name, email, password
- Submit

### 3. Login
- Use the email and password from registration

### 4. Create a Project
- Click "+ New Project"
- Enter project name and description
- Submit

### 5. Add Team Members
- In a project, click the "+ Add Member" button
- Enter a member's email address
- They'll be added to the project

### 6. Create Tasks
- Inside a project, click "+ New Task"
- Fill in task details
- Select priority and due date
- Submit

### 7. Manage Tasks
- Change task status using the dropdown
- Delete tasks if you're the admin
- View dashboard statistics in the sidebar

## 📂 Project Structure

```
team-task-manager/
│
├── backend/                          # Express.js Backend
│   ├── models/
│   │   ├── User.js                   # User schema with password hashing
│   │   ├── Project.js                # Project schema
│   │   └── Task.js                   # Task schema
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── projects.js               # Project management endpoints
│   │   └── tasks.js                  # Task management endpoints
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   ├── server.js                     # Main server file
│   ├── package.json                  # Backend dependencies
│   └── .env.example                  # Environment variables template
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   └── index.html                # HTML entry point
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js          # Login page
│   │   │   ├── RegisterPage.js       # Registration page
│   │   │   ├── DashboardPage.js      # Project list and dashboard
│   │   │   └── ProjectPage.js        # Project details and tasks
│   │   ├── context/
│   │   │   └── AuthContext.js        # Authentication context
│   │   ├── utils/
│   │   │   └── api.js                # Axios API client
│   │   ├── styles/
│   │   │   ├── Auth.css              # Authentication pages styling
│   │   │   ├── Dashboard.css         # Dashboard styling
│   │   │   └── Project.css           # Project page styling
│   │   ├── App.js                    # Main app component
│   │   ├── index.js                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── package.json                  # Frontend dependencies
│   └── .env.example                  # Environment variables template
│
├── README.md                         # Complete documentation
├── QUICKSTART.md                     # Quick start guide
├── SETUP_GUIDE.md                    # This file
├── package.json                      # Root package configuration
├── setup.sh                          # Setup script (Mac/Linux)
├── setup.bat                         # Setup script (Windows)
└── .gitignore                        # Git ignore rules
```

## 🔑 Key Features Implemented

### Authentication
- Register with email and password
- Login with JWT tokens
- Automatic token refresh
- Secure password hashing with bcrypt

### Projects
- Create new projects
- Add team members by email
- Remove members
- Admin-only deletion

### Tasks
- Create tasks with priority levels
- Assign tasks to team members
- Update task status (To Do → In Progress → Done)
- Set due dates
- View task details

### Dashboard
- Total tasks count
- Tasks grouped by status
- Tasks per user statistics
- Overdue tasks tracking
- Member list with roles

### Security
- Password hashing
- JWT authentication
- Role-based access control
- Input validation
- CORS protection

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:memberId` - Remove member

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/project/:projectId/stats` - Get statistics

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in .env
- For Atlas, ensure IP is whitelisted

### Frontend Can't Connect to Backend
- Check REACT_APP_API_URL in frontend/.env
- Verify backend is running on port 5000
- Check CORS settings in backend/server.js

### Clear Cache
```bash
# Frontend
rm -rf frontend/node_modules frontend/package-lock.json
npm install

# Backend
rm -rf backend/node_modules backend/package-lock.json
npm install
```

## 🚀 Deployment

For complete deployment instructions to Railway, see [README.md](./README.md)

Quick steps:
1. Push code to GitHub
2. Create Railway account
3. Connect repository
4. Configure environment variables
5. Deploy backend and frontend

## 📚 Learn More

- MongoDB: https://docs.mongodb.com/
- Express: https://expressjs.com/
- React: https://react.dev/
- JWT: https://jwt.io/
- Railway: https://railway.app/

## 🎉 You're All Set!

Your Team Task Manager is ready to use. Start the application and begin managing tasks with your team!

### Next Steps
1. Run `npm run dev` to start the application
2. Open http://localhost:3000 in your browser
3. Register a new account
4. Create your first project
5. Invite team members
6. Start creating and managing tasks!

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the README.md for detailed documentation
3. Check console logs for error messages
4. Verify all environment variables are set correctly

---

**Happy Task Managing! 🚀**

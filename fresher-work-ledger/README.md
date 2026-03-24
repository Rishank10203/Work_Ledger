# Work Ledger Platform (Rebuilt)

A modern, scalable, production-ready Project Management System tailored for software companies.

## 🚀 Tech Stack
-   **Frontend**: React (Vite), Tailwind CSS v4, Zustand, Framer Motion, Recharts
-   **Backend**: Node.js, Express.js (ES Modules)
-   **Database**: MongoDB (Mongoose)

## 📁 Repository Structure
```
fresher-work-ledger/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Elements (Button, Card, Input, Layout)
│   │   ├── pages/          # Views (Dashboard, Kanban, Time Tracking)
│   │   ├── store/          # Zustand State Management
│   │   └── App.jsx         # React Router integration
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Node.js/Express Backend
│   ├── controllers/        # Business Logic (User, Client, Project, Task, Time)
│   ├── middleware/         # JWT Auth & Error Handling
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   ├── server.js           # Express App Entry
│   └── Dockerfile
└── docker-compose.yml      # Local Multi-Container Deployment
```

## 🛠 Features Implemented
1.  **JWT & RBAC**: Roles (Admin, PM, Team Member, Client).
2.  **Dashboard**: Stats and charts.
3.  **Kanban Board**: Drag & Drop tasks via `@hello-pangea/dnd`.
4.  **Time Tracking**: Real-time timer & manual entry tied to tasks.
5.  **Entities**: Advanced management for Clients, Projects, Tasks, and Reports.

## 🐳 Deployment (Docker)

To run the application locally or in a cloud VM:

1. Ensure Docker and docker-compose are installed on your machine.
2. Clone this repo and navigate to `fresher-work-ledger`.
3. Start the containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```
4. Access the frontend at `http://localhost:5173` (mapped to port 80 in container).
5. The backend API is available via standard reverse proxying at `/api` or directly at `http://localhost:5000`.

## ☁️ Cloud Deployment (e.g., AWS, Render)
-   **Backend**: Deploy the `server` folder on a Render Web Service or AWS EC2. Add environment variables (MONGODB_URI, JWT_SECRET).
-   **Frontend**: Deploy the `client` folder on Vercel or Netlify. Update `/client/src/store/authStore.js` and `axios` configs to point to your deployed backend URL.
-   **Database**: Create a free MongoDB Atlas cluster and pass the connection string.

---
*Developed with pristine architecture, tailored for high-scale enterprise operations.*

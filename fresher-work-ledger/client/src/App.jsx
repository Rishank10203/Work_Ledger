import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Clients } from './pages/Clients';
import Tasks from './pages/Tasks';
import { Users } from './pages/Users';
import { TimeTrack } from './pages/TimeTrack';
import { Reports } from './pages/Reports';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="clients" element={<Clients />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="users" element={<Users />} />
            <Route path="time" element={<TimeTrack />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

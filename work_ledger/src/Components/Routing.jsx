import React, { Component } from 'react'
import { Router, Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
// import Register from './Register'
import Login from './Login'
// import ForgetPassword from './ForgetPassword'
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css"
// import Dashboard from './Dashboard'
import Dashboard from './Dashboard'
import ProtectedRoutes from '../Store/ProtectedRoutes'
// import User from './dashboard_components/Pages/User'
import Users from './dashboardComponents/admin_pages/Users'
import SessionTimeout from '../Store/SessionTimeout'
import Clients from './dashboardComponents/admin_pages/Clients'
import Projects from './dashboardComponents/admin_pages/Projects'
import Roles from './dashboardComponents/admin_pages/Roles'
import Task from './dashboardComponents/admin_pages/Task'
import TimeTracking from './dashboardComponents/admin_pages/TimeTracking'
import KanbanBoard from './dashboardComponents/admin_pages/KanbanBoard'
export class Routing extends Component {
  render() {
    return (
      <BrowserRouter>
        <SessionTimeout />
        <Routes>
          {/* <Route path='/dashboard' element={<Dashboard/>}/> */}
          {/* <Route path='/register' element={<Register />} /> */}
          <Route path='/login' element={<Login />} />
          {/* <Route path='/forgetpassword' element={<ForgetPassword />} /> */}

          <Route element={<ProtectedRoutes />}>

            <Route path="/dashboard" element={<Dashboard />} >
            <Route index element={<Navigate to='task' replace />}/>
            <Route path="users" element={<Users />} />
            <Route path='clients' element={<Clients/>} />
            <Route path='projects' element={<Projects/>}/>
            <Route path='roles' element={<Roles/>}/>
             <Route path='task' element={<Task/>}/>
             <Route path='track' element={<TimeTracking/>}/>
             <Route path='board' element={<KanbanBoard/>}/>
            </Route>
          </Route>
        </Routes>

      </BrowserRouter>
    )
  }
}

export default Routing
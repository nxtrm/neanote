import React from 'react';
import Layout from "../components/Layout/Layout";

import {
  BrowserRouter as Router, Routes, Route,
  createBrowserRouter
} from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard.tsx";
import Login from "./Pages/Login/Login.tsx";
import Register from "./Pages/Register/Register.tsx";
import withTokenCheck from '../components/providers/token-check.tsx';
import Landing from './Pages/Landing/Landing.tsx';
import Notes from './Pages/Notes/Notes.tsx';
import Tasks from './Pages/Tasks/Tasks.tsx';
import Tags from './Pages/Tags/Tags.tsx';
import EditTasks from './Pages/Tasks/EditTasks.tsx';
import Habits from './Pages/Habits/Habits.tsx';
import EditHabits from './Pages/Habits/EditHabits.tsx';
import Goals from './Pages/Goals/Goals.tsx';
import EditGoals from './Pages/Goals/EditGoals.tsx';


const CheckedLayout = withTokenCheck(Layout);

const AppRouter = () => (

  <Router>
    <Routes>
      <Route path="/" element={<CheckedLayout />}> 
        <Route index element={<Dashboard />} />
        <Route path="account" element={<div>Account</div>} />
        <Route path="notes" element={<Notes />}/>

        <Route path="tasks" element={<Tasks/>} />
        <Route path="tasks/edit" element={<EditTasks/>} />
        <Route path="tasks/create" element={<EditTasks/>} />

        <Route path="habits" element={<Habits/>} />
        <Route path="habits/edit" element={<EditHabits/>} />
        <Route path="habits/create" element={<EditHabits/>} />

        <Route path="goals" element={<Goals/>} />
        <Route path="goals/edit" element={<EditGoals/>} />
        <Route path="goals/create" element={<EditGoals/>} />

        <Route path="tags" element={<Tags/>} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="get-started" element={<Landing/>} />
    </Routes>
  </Router>
);
export default AppRouter 
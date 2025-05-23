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
import Notes from './Pages/Tasks copy/Notes.tsx';
import Tasks from './Pages/Tasks/Tasks.tsx';
import Tags from './Pages/Tags/Tags.tsx';
import EditTasks from './Pages/Tasks/EditTasks.tsx';
import Habits from './Pages/Habits/Habits.tsx';
import EditHabits from './Pages/Habits/EditHabits.tsx';
import Goals from './Pages/Goals/Goals.tsx';
import EditGoals from './Pages/Goals/EditGoals.tsx';
import CreateGoal from './Pages/Goals/CreateGoal.tsx';
import CreateTask from './Pages/Tasks/CreateTask.tsx';
import CreateHabits from './Pages/Habits/CreateHabits.tsx';
import Archive from './Pages/Archive/Archive.tsx';
import Account from './Pages/Account/Account.tsx';
import CreateNote from './Pages/Tasks copy/CreateNote.tsx';
import EditNotes from './Pages/Tasks copy/EditNotes.tsx';
import Calendar from './Pages/Calendar/Calendar.tsx';

const CheckedLayout = withTokenCheck(Layout);

const AppRouter = () => (

  <Router>
    <Routes>
      <Route path="/" element={<CheckedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="account" element={<Account/>} />
        <Route path="calendar" element={<Calendar/>} />

        <Route path="notes" element={<Notes/>} />
        <Route path="notes/edit" element={<EditNotes/>} />
        <Route path="notes/create" element={<CreateNote/>} />

        <Route path="tasks" element={<Tasks/>} />
        <Route path="tasks/edit" element={<EditTasks/>} />
        <Route path="tasks/create" element={<CreateTask/>} />

        <Route path="habits" element={<Habits/>} />
        <Route path="habits/edit" element={<EditHabits/>} />
        <Route path="habits/create" element={<CreateHabits/>} />

        <Route path="goals" element={<Goals/>} />
        <Route path="goals/edit" element={<EditGoals/>} />
        <Route path="goals/create" element={<CreateGoal/>} />


        <Route path="archive" element={<Archive/>} />
        <Route path="tags" element={<Tags/>} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="get-started" element={<Landing/>} />
    </Routes>
  </Router>
);
export default AppRouter 
import React from 'react';
import Layout from "../components/Layout/Layout";

import {
  createBrowserRouter
} from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard.tsx";
import Login from "./Pages/Login/Login.tsx";
import Register from "./Pages/Register/Register.tsx";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "/account", element: <div>Account</div> },
      ]
    },
    {
      path: "/login" ,
      element: <Login/>
    },
    {
      path: "/register" ,
      element: <Register/>
    }
    ]);

export default router
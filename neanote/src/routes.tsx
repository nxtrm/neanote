import Layout from "../components/Layout/Layout";
import App from './App.tsx'
import React from 'react';

import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard.tsx";
import Login from "./Pages/Login/Login.tsx";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children: [
        { index: true, element: <Dashboard /> },
      ]
    },
    {
      path: "/login" ,
      element: <Login/>
    }
    ]);

export default router
import Layout from "../components/Layout/Layout";
import App from './App.tsx'
import React from 'react';

import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import Dashboard from "./assets/Pages/Dashboard/Dashboard.tsx";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "login", element: <div>Login</div>}
      ]
    },
    ]);

export default router
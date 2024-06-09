import Layout from "../components/Layout/Layout";
import App from './App.tsx'
import React from 'react';

import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children: [
        { index: true, element: <App /> },
      ]
    },
    ]);

export default router
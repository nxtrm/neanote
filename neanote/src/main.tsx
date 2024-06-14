import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from '../components/providers/theme-provider.tsx'
import withTokenCheck from "../components/providers/token-check.tsx";
import './index.css'
import router from './routes.tsx'
import AppRouter from "./routes.tsx";

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRouter/>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)
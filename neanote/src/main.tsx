import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '../components/providers/theme-provider.tsx';
import './index.css';
import AppRouter from "./routes.tsx";
import { ScreenSizeProvider } from "./DisplayContext.tsx";

// Create a client
const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ScreenSizeProvider>
        <AppRouter/>
        <ToastContainer/>
      </ScreenSizeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)
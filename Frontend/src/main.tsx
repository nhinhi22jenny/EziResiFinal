import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './ThemeContext.tsx'; // Adjust the path to where your ThemeProvider is defined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap the app with ThemeProvider */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

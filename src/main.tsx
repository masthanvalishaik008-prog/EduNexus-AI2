import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './firebase/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AuthProvider>
);

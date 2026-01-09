import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'sonner';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0A0A0A',
          color: '#E1E1E1',
          border: '1px solid #262626',
          fontFamily: 'Manrope, sans-serif',
        },
        className: 'toast',
        duration: 4000,
      }}
    />
  </React.StrictMode>
);
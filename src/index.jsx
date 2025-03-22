import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Création de la root React (Vite supporte React 18)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
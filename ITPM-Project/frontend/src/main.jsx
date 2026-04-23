import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LectureSummaryProvider } from "./context/LectureSummaryContext.jsx";
import './index.css';
import './styles/global.css';
import './styles/home.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LectureSummaryProvider>
      <App />
    </LectureSummaryProvider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LectureSummaryProvider } from "./context/LectureSummaryContext.jsx";
import "./styles/global.css";
import "./styles/home.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LectureSummaryProvider>
        <App />
      </LectureSummaryProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./store/AuthContext.jsx";
import { StudyProvider } from "./store/StudyContext.jsx";
import { TimerProvider } from "./store/TimerContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StudyProvider>
          <TimerProvider>
            <App />
          </TimerProvider>
        </StudyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

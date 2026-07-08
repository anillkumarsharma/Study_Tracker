import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import DailyQuote from "./components/DailyQuote";
import ChatWidget from "./components/ChatWidget";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Routine from "./pages/Routine";
import TimeLog from "./pages/TimeLog";
import Analytics from "./pages/Analytics";
import Reminders from "./pages/Reminders";
import Goals from "./pages/Goals";
import { useAuth } from "./store/AuthContext";

function App() {
  const { user } = useAuth();

  // No account yet -> only the login screen is reachable.
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <>
      <DailyQuote />
      <ChatWidget />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/time-log" element={<TimeLog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reminders" element={<Reminders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

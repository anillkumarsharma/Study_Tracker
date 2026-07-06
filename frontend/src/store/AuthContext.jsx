import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/studyApi";

const AuthContext = createContext(null);

const AUTH_KEY = "studylog_auth";
const TOKEN_KEY = "studylog_token";

function readUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Restore the session on load so a logged-in user is never signed out.
  const [user, setUser] = useState(readUser);

  // Keep the stored copy fresh (e.g. name updates) once we have a user.
  useEffect(() => {
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }, [user]);

  // Passwordless login. Returns an error string, or null on success.
  const login = async (name, username) => {
    try {
      const { token, user: u } = await authApi.login(name, username);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(AUTH_KEY, JSON.stringify(u));
      setUser(u);
      return null;
    } catch (err) {
      return (
        err.response?.data?.message ||
        "Could not reach the server. Is the backend running?"
      );
    }
  };

  // Update the weekly hours goal and refresh the stored user.
  const updateGoal = async (weeklyGoalHours) => {
    const { user: u } = await authApi.updateGoal(weeklyGoalHours);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, login, updateGoal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

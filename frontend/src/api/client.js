import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_URL });

// Attach the saved JWT to every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("studylog_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 means the stored token is missing, expired, or points at a user that
// no longer exists (e.g. after switching databases). Clear the stale session
// and send the user back to login instead of throwing uncaught errors.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("studylog_token");
      localStorage.removeItem("studylog_auth");
      // Hard redirect so React state resets and the login screen loads cleanly.
      if (window.location.pathname !== "/login") {
        window.location.assign("/");
      }
    }
    return Promise.reject(error);
  }
);

export default client;

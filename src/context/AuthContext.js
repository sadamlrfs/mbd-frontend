import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Extract user details from token
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.user && decoded.user.id) {
          setUser({ id: decoded.user.id });
        }
      } catch (err) {
        console.error("Error processing token:", err);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    }

    setLoading(false);
  }, []);

  // ✅ FIXED: register function should NOT store token or update user state
  const register = async (name, email, password, navigate) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      alert(response.data.msg || "Registration successful! Please login.");
      return { success: true };
      navigate("/login"); // Redirect user to login page
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
      return {
        success: false,
        error: err.response?.data?.msg || "Registration failed",
      };
    }
  };

  // ✅ Login function remains unchanged
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.user && decoded.user.id) {
          setUser({ id: decoded.user.id });
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
      return {
        success: false,
        error: err.response?.data?.msg || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = { user, loading, error, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

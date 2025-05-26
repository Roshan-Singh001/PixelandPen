// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Optional token validation
        // const response = await fetch("/api/validate-token", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });

        setLoggedIn(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("authToken");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const logout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/logout",
        {},
        { withCredentials: true }
      );
      console.log(response.data.message); 

      localStorage.removeItem("authToken");
      setLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ loggedIn, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

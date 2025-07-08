// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

const AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  // const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
          const response = await AxiosInstance.get("/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          const { username, role, id } = response.data;
          setUserData({ userName: username, userRole: role, user_id: id });
          setLoggedIn(true);
      }
      catch (err) {
        console.error("Auth check failed:", err);
        logout();
      } 
      finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await AxiosInstance.post("/logout");
      // console.log(response.data.message);
    } 
    catch (error) {
      console.error("Logout failed:", error);
    }
    finally{
      localStorage.removeItem("authToken");
      setLoggedIn(false);
      setUserData(null);
    }
  };

  return (
    <AuthContext.Provider value={{ loggedIn, loading, logout, userData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

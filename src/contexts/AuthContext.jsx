import React, { createContext, useContext, useEffect, useState } from "react";
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

  const login = async (username, password, role) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.post("/validate", {
        username,
        password,
        role,
      });

      const result = response.data;
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        const profileResponse = await AxiosInstance.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${result.token}`,
          },
        });
        const { username: profileUsername, role: profileRole, id: profileId } = profileResponse.data;
        setUserData({ userName: profileUsername, userRole: profileRole, user_id: profileId });
        setLoggedIn(true);
        return { success: true, userRole: profileRole };
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      // setLoggedIn(false);
      // setUserData({});
      localStorage.removeItem("authToken");
      return { success: false, error: error.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AxiosInstance.post("/logout");
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
    <AuthContext.Provider value={{ loggedIn, setLoggedIn,loading, logout,login, userData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

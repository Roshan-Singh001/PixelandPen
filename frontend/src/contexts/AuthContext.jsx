import React, { createContext, useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext();

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const checkAuth = async () => {

      try {
          const response = await AxiosInstance.get("/auth/profile");
      
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
      console.log("Login response:", result);

      if (result?.user_id) {
        const profileResponse = await AxiosInstance.get("/auth/profile");
        const { username: profileUsername, role: profileRole, id: profileId } = profileResponse.data;
        setUserData({ userName: profileUsername, userRole: profileRole, user_id: profileId });
        setLoggedIn(true);
        return { success: true, userRole: profileRole };
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login failed:", error);
      await logout();
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

// src/context/UserAccessContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import mainapi from "api/mainapi";

const UserAccessContext = createContext(null);

export const useUserAccess = () => useContext(UserAccessContext);

export const UserAccessProvider = ({ children }) => {
  const [userAccess, setUserAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAccess = async () => {
    try {
      setLoading(true);
      const BASE_URL = mainapi.BASE_URL;
      const res = await axios.get(`${BASE_URL}/user-access/user-state/userpremissions`, {
        withCredentials: true, // if using cookies
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // if using JWT
        },
      });
      setUserAccess(res.data);
    } catch (err) {
      console.error("Failed to fetch user access:", err);
      setUserAccess(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAccess();
  }, []);

  return (
    <UserAccessContext.Provider value={{ userAccess, loading, refetch: fetchUserAccess }}>
      {children}
    </UserAccessContext.Provider>
  );
};

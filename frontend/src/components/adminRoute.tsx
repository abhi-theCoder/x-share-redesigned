//adminRoute.tsx 
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "../api"; // 👈 Your configured Axios instance
import Loader from "../components/Loader"; // optional spinner component

const AdminRoute: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // 👇 Call backend to verify admin
        const res = await axios.get("/api/auth/check-admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Expect backend to return something like { isAdmin: true }
        setIsAdmin(res.data?.isAdmin === true);
      } catch (error) {
        console.error("Admin verification failed:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (loading) return <Loader />; // or simple <div>Loading...</div>

  // Redirect non-admins to login or unauthorized page
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  // ✅ Render protected admin routes
  return <Outlet />;
};

export default AdminRoute;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function CheckAuth({ children, protectedRouter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("CheckAuth: Current location:", location.pathname);
    console.log("CheckAuth: Protected router:", protectedRouter);
    
    const token = localStorage.getItem("token");
    console.log("CheckAuth: Token exists:", !!token);

    if (protectedRouter) {
      // This is a protected route
      if (!token) {
        console.log("CheckAuth: No token, redirecting to login");
        navigate("/login");
      } else {
        console.log("CheckAuth: Token found, allowing access to protected route");
        setLoading(false);
      }
    } else {
      // This is a public route (login/signup)
      if (token) {
        console.log("CheckAuth: Token exists, redirecting to home");
        navigate("/");
      } else {
        console.log("CheckAuth: No token, allowing access to public route");
        setLoading(false);
      }
    }
  }, [navigate, protectedRouter, location.pathname]);

  console.log("CheckAuth: Loading state:", loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div>Loading...</div>
          <div className="text-xs text-gray-500 mt-2">
            Checking authentication for: {location.pathname}
          </div>
        </div>
      </div>
    );
  }

  console.log("CheckAuth: Rendering children");
  return children;
}

export default CheckAuth;
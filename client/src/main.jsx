import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckAuth from "./components/check-auth.jsx";
import Signup from "./pages/signup.jsx";
import Login from "./pages/login.jsx";
import Tickets from "./pages/tickets.jsx";
import TicketDetails from "./pages/ticketDetail.jsx";
import Admin from "./pages/admin.jsx";
import Navbar from "./components/navbar.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth protectedRouter={true}>
              <Tickets />
            </CheckAuth>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <CheckAuth protectedRouter={true}>
              <TicketDetails />
            </CheckAuth>
          }
        />

        <Route
          path="/login"
          element={
            <CheckAuth protectedRouter={false}>
              <Login />
            </CheckAuth>
          }
        />

        <Route
          path="/sign-up"
          element={
            <CheckAuth protectedRouter={false}>
              <Signup />
            </CheckAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <CheckAuth protectedRouter={true}>
              <Admin />
            </CheckAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  // </StrictMode>
);

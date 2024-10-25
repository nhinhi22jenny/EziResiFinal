import { Routes, Route } from "react-router-dom";
import React from "react";

// Auth pages
import Signup from "./pages/auth/signup";
import SignupMigrant from "./pages/auth/signup_migrant";
import SignupProvider from "./pages/auth/signup_provider";
import SignupAgent from "./pages/auth/signup_agent";
import Login from "./pages/auth/login";
import Logout from "./pages/logout";

import Migrant from "./pages/migrant";
import Dashboard from "./pages/admin/dashboard";
import Statistics from "./pages/admin/statistics";
import Occupations from "./pages/admin/occupations";
import Provider from "./pages/Provider";
import Profile from "./pages/Profile";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup/migrant" element={<SignupMigrant />} />
      <Route path="/signup/provider" element={<SignupProvider />} />
      <Route path="/signup/agent" element={<SignupAgent />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/statistics" element={<Statistics />} />
      <Route path="/admin/occupations" element={<Occupations />} />
      <Route path="/provider/dashboard" element={<Provider />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/migrant/dashboard" element={<Migrant />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/agent/dashboard" element={<Statistics />} />
    </Routes>
  );
};

export default AppRoutes;

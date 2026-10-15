import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import TruckOwnerDashboard from "./pages/TruckOwnerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import "./styles/App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    axios
      .get("/api/method/sbt.sbt.api.get_user_role_and_linked_doc")
      .then((response) => {
        setUser(response.data.message);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading SBT...</div>;
  }

  if (!user || !user.sbt_role) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${user.sbt_role.toLowerCase()}`} />} />
        <Route path="/admin/*" element={<AdminDashboard user={user} />} />
        <Route path="/agent/*" element={<AgentDashboard user={user} />} />
        <Route path="/customer/*" element={<CustomerDashboard user={user} />} />
        <Route path="/truck-owner/*" element={<TruckOwnerDashboard user={user} />} />
        <Route path="/driver/*" element={<DriverDashboard user={user} />} />
        <Route path="*" element={<Navigate to={`/${user.sbt_role.toLowerCase()}`} />} />
      </Routes>
    </Router>
  );
}

export default App;

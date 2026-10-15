import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await axios.get(
        "/api/method/sbt.sbt.api.get_dashboard_stats"
      );
      setStats(statsResponse.data.message || {});

      // Load various data
      const agentsResponse = await axios.get("/api/resource/Agent");
      setAgents(agentsResponse.data.data || []);

      const trucksResponse = await axios.get("/api/resource/Truck");
      setTrucks(trucksResponse.data.data || []);

      const bookingsResponse = await axios.get("/api/resource/Booking");
      setBookings(bookingsResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SBT Admin Portal</h1>
        <p>Welcome, System Administrator</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`nav-tab ${activeTab === "agents" ? "active" : ""}`}
          onClick={() => setActiveTab("agents")}
        >
          Agents
        </button>
        <button
          className={`nav-tab ${activeTab === "trucks" ? "active" : ""}`}
          onClick={() => setActiveTab("trucks")}
        >
          Trucks
        </button>
        <button
          className={`nav-tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "overview" && (
          <section className="section">
            <h2>Platform Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.total_bookings || 0}</h3>
                <p>Total Bookings</p>
              </div>
              <div className="stat-card">
                <h3>{stats.active_bookings || 0}</h3>
                <p>Active Bookings</p>
              </div>
              <div className="stat-card">
                <h3>{stats.completed_bookings || 0}</h3>
                <p>Completed</p>
              </div>
              <div className="stat-card">
                <h3>{stats.total_trucks || 0}</h3>
                <p>Total Trucks</p>
              </div>
              <div className="stat-card">
                <h3>{stats.available_trucks || 0}</h3>
                <p>Available</p>
              </div>
              <div className="stat-card">
                <h3>{stats.total_customers || 0}</h3>
                <p>Customers</p>
              </div>
              <div className="stat-card">
                <h3>{stats.total_drivers || 0}</h3>
                <p>Drivers</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "agents" && (
          <section className="section">
            <h2>Agents Management</h2>
            {agents.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Mobile</th>
                      <th>Region</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.name}>
                        <td>{agent.agent_name}</td>
                        <td>{agent.mobile_number}</td>
                        <td>{agent.region}</td>
                        <td className={`status ${agent.status}`}>
                          {agent.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No agents found.</p>
            )}
          </section>
        )}

        {activeTab === "trucks" && (
          <section className="section">
            <h2>Trucks Management</h2>
            {trucks.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Truck Number</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Owner</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((truck) => (
                      <tr key={truck.name}>
                        <td>{truck.truck_number}</td>
                        <td>{truck.truck_type}</td>
                        <td>{truck.capacity} Ton</td>
                        <td>{truck.truck_owner}</td>
                        <td className={`status ${truck.availability_status}`}>
                          {truck.availability_status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No trucks found.</p>
            )}
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="section">
            <h2>Recent Bookings</h2>
            {bookings.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>From → To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 20).map((booking) => (
                      <tr key={booking.name}>
                        <td>{booking.name}</td>
                        <td>{booking.customer}</td>
                        <td>
                          {booking.from_location} → {booking.to_location}
                        </td>
                        <td className={`status ${booking.booking_status}`}>
                          {booking.booking_status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No bookings found.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;

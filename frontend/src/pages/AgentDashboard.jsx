import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function AgentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      if (user.linked_doc_name) {
        const bookingsResponse = await axios.post(
          "/api/method/sbt.sbt.api.get_active_bookings",
          { agent_name: user.linked_doc_name }
        );
        setBookings(bookingsResponse.data.message || []);
      }

      const driversResponse = await axios.get("/api/resource/Driver");
      setDrivers(driversResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load agent data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (bookingName, driverName) => {
    try {
      await axios.post(
        "/api/method/sbt.sbt.api.assign_driver_to_booking",
        {
          booking_name: bookingName,
          driver_name: driverName,
        }
      );
      alert("Driver assigned successfully!");
      loadAgentData();
    } catch (error) {
      console.error("Failed to assign driver:", error);
      alert("Failed to assign driver");
    }
  };

  const handleConfirmBooking = async (bookingName) => {
    try {
      await axios.post(
        "/api/method/sbt.sbt.api.confirm_booking",
        { booking_name: bookingName }
      );
      alert("Booking confirmed!");
      loadAgentData();
    } catch (error) {
      console.error("Failed to confirm booking:", error);
      alert("Failed to confirm booking");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SBT Agent Portal</h1>
        <p>Welcome, {user.email}</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          Manage Bookings
        </button>
        <button
          className={`nav-tab ${activeTab === "drivers" ? "active" : ""}`}
          onClick={() => setActiveTab("drivers")}
        >
          Drivers
        </button>
        <button
          className={`nav-tab ${activeTab === "trips" ? "active" : ""}`}
          onClick={() => setActiveTab("trips")}
        >
          Track Trips
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "bookings" && (
          <section className="section">
            <h2>Manage Bookings</h2>
            {bookings.length > 0 ? (
              <div className="bookings-grid">
                {bookings.map((booking) => (
                  <div
                    key={booking.name}
                    className="booking-card"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <h3>{booking.name}</h3>
                    <p>
                      <strong>Customer:</strong> {booking.customer}
                    </p>
                    <p>
                      <strong>Route:</strong> {booking.from_location} →{" "}
                      {booking.to_location}
                    </p>
                    <p>
                      <strong>Date:</strong> {booking.required_date}
                    </p>
                    <p className={`status ${booking.booking_status}`}>
                      {booking.booking_status}
                    </p>

                    {booking.booking_status === "Pending" && (
                      <button
                        className="confirm-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmBooking(booking.name);
                        }}
                      >
                        Confirm Booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No bookings to manage.</p>
            )}

            {selectedBooking && (
              <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Assign Driver - {selectedBooking.name}</h3>
                  <div className="drivers-list">
                    {drivers.map((driver) => (
                      <button
                        key={driver.name}
                        className="driver-option"
                        onClick={() => {
                          handleAssignDriver(selectedBooking.name, driver.name);
                          setSelectedBooking(null);
                        }}
                      >
                        {driver.driver_name} - {driver.license_number}
                      </button>
                    ))}
                  </div>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "drivers" && (
          <section className="section">
            <h2>Drivers</h2>
            {drivers.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Driver Name</th>
                      <th>License</th>
                      <th>Mobile</th>
                      <th>Verification</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.name}>
                        <td>{driver.driver_name}</td>
                        <td>{driver.license_number}</td>
                        <td>{driver.mobile_number}</td>
                        <td className={`status ${driver.verification_status}`}>
                          {driver.verification_status}
                        </td>
                        <td className={`status ${driver.status}`}>
                          {driver.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No drivers available.</p>
            )}
          </section>
        )}

        {activeTab === "trips" && (
          <section className="section">
            <h2>Track Trips</h2>
            <p>Real-time tracking for active trips will be displayed here.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default AgentDashboard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function DriverDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("my-trip");
  const [trip, setTrip] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [tripStatus, setTripStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    setLoading(true);
    try {
      if (user.linked_doc_name) {
        const bookingsResponse = await axios.post(
          "/api/method/sbt.sbt.api.get_active_bookings",
          { driver_name: user.linked_doc_name }
        );
        setBookings(bookingsResponse.data.message || []);
      }
    } catch (error) {
      console.error("Failed to load driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTrip = async (bookingName) => {
    try {
      const response = await axios.post(
        "/api/method/sbt.sbt.api.get_trip_tracking",
        { booking_name: bookingName }
      );
      setTrip(response.data.message || null);
      if (response.data.message) {
        setTripStatus(response.data.message.trip_status);
      }
    } catch (error) {
      console.error("Failed to load trip:", error);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!trip) {
      alert("No trip selected");
      return;
    }

    try {
      await axios.post(
        "/api/method/sbt.sbt.api.update_trip_status",
        {
          booking_name: trip.booking,
          new_status: newStatus,
          current_location: currentLocation,
        }
      );
      alert(`Trip status updated to ${newStatus}`);
      setTripStatus(newStatus);
      loadDriverData();
    } catch (error) {
      console.error("Failed to update trip status:", error);
      alert("Failed to update trip status");
    }
  };

  const statusOptions = [
    "Assigned",
    "Accepted",
    "Pickup",
    "In Transit",
    "Delivered",
    "Completed",
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SBT Driver Portal</h1>
        <p>Welcome, {user.email}</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "my-trip" ? "active" : ""}`}
          onClick={() => setActiveTab("my-trip")}
        >
          My Current Trip
        </button>
        <button
          className={`nav-tab ${activeTab === "trips" ? "active" : ""}`}
          onClick={() => setActiveTab("trips")}
        >
          Trip History
        </button>
        <button
          className={`nav-tab ${activeTab === "earnings" ? "active" : ""}`}
          onClick={() => setActiveTab("earnings")}
        >
          Earnings
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "my-trip" && (
          <section className="section">
            <h2>Current Trip</h2>

            {!trip ? (
              <div>
                <h3>Select an Active Trip</h3>
                {bookings.length > 0 ? (
                  <div className="trips-list">
                    {bookings.map((booking) => (
                      <div key={booking.name} className="trip-option">
                        <h4>{booking.name}</h4>
                        <p>
                          {booking.from_location} → {booking.to_location}
                        </p>
                        <p>Status: {booking.booking_status}</p>
                        <button
                          className="load-btn"
                          onClick={() => handleLoadTrip(booking.name)}
                        >
                          Load Trip
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No active trips assigned.</p>
                )}
              </div>
            ) : (
              <div className="trip-details">
                <h3>Trip: {trip.booking}</h3>
                <div className="trip-info">
                  <p>
                    <strong>Pickup:</strong> {trip.pickup_location}
                  </p>
                  <p>
                    <strong>Destination:</strong> {trip.destination}
                  </p>
                  <p>
                    <strong>Current Location:</strong> {trip.current_location}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status ${trip.trip_status}`}>
                      {trip.trip_status}
                    </span>
                  </p>
                </div>

                <div className="trip-controls">
                  <label>Update Current Location:</label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="Your current location"
                  />

                  <label>Update Trip Status:</label>
                  <div className="status-buttons">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${
                          tripStatus === status ? "active" : ""
                        }`}
                        onClick={() => handleUpdateStatus(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="unload-btn"
                  onClick={() => {
                    setTrip(null);
                    setCurrentLocation("");
                    setTripStatus("");
                  }}
                >
                  Close Trip
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === "trips" && (
          <section className="section">
            <h2>Trip History</h2>
            {bookings.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Route</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.name}>
                        <td>{booking.name}</td>
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
              <p>No trip history.</p>
            )}
          </section>
        )}

        {activeTab === "earnings" && (
          <section className="section">
            <h2>Earnings & Settlement</h2>
            <p>Earnings summary and settlement details will appear here.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default DriverDashboard;

import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

function CustomerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("book-truck");
  const [trucks, setTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState({
    from_location: "",
    to_location: "",
    required_date: "",
    truck_type: "",
    min_capacity: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/method/sbt.sbt.api.search_available_trucks",
        searchParams
      );
      setTrucks(response.data.message || []);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to search trucks");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTruck = async (truckName) => {
    if (!user.linked_doc_name) {
      alert("Customer profile not found");
      return;
    }

    try {
      const distance = parseFloat(
        prompt("Enter estimated distance (KM):", "")
      );
      if (!distance || distance <= 0) {
        alert("Please enter a valid distance");
        return;
      }

      const response = await axios.post(
        "/api/method/sbt.sbt.api.create_customer_booking",
        {
          customer: user.linked_doc_name,
          from_location: searchParams.from_location,
          to_location: searchParams.to_location,
          required_date: searchParams.required_date,
          truck: truckName,
          load_weight: parseFloat(searchParams.min_capacity) || 0,
          total_distance: distance,
        }
      );

      const booking = response.data.message;
      alert(
        `Booking created! ID: ${booking.name}\nTotal: ₹${booking.total_amount}`
      );
      setActiveTab("my-bookings");
      loadBookings();
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to create booking");
    }
  };

  const loadBookings = async () => {
    if (!user.linked_doc_name) return;
    try {
      const response = await axios.post(
        "/api/method/sbt.sbt.api.get_active_bookings",
        { customer_name: user.linked_doc_name }
      );
      setBookings(response.data.message || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "my-bookings") {
      loadBookings();
    }
  }, [activeTab]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SBT Customer Portal</h1>
        <p>Welcome, {user.email}</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "book-truck" ? "active" : ""}`}
          onClick={() => setActiveTab("book-truck")}
        >
          Book a Truck
        </button>
        <button
          className={`nav-tab ${activeTab === "my-bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("my-bookings")}
        >
          My Bookings
        </button>
        <button
          className={`nav-tab ${activeTab === "track-trip" ? "active" : ""}`}
          onClick={() => setActiveTab("track-trip")}
        >
          Track Trip
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "book-truck" && (
          <section className="section">
            <h2>Search & Book a Truck</h2>
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label>From Location</label>
                  <input
                    type="text"
                    name="from_location"
                    value={searchParams.from_location}
                    onChange={handleSearchChange}
                    placeholder="e.g., Coimbatore"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>To Location</label>
                  <input
                    type="text"
                    name="to_location"
                    value={searchParams.to_location}
                    onChange={handleSearchChange}
                    placeholder="e.g., Chennai"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Required Date</label>
                  <input
                    type="date"
                    name="required_date"
                    value={searchParams.required_date}
                    onChange={handleSearchChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Truck Type</label>
                  <select
                    name="truck_type"
                    value={searchParams.truck_type}
                    onChange={handleSearchChange}
                  >
                    <option value="">Any Type</option>
                    <option value="Open Body">Open Body</option>
                    <option value="Container">Container</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Mini Truck">Mini Truck</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Minimum Capacity (Ton)</label>
                <input
                  type="number"
                  name="min_capacity"
                  value={searchParams.min_capacity}
                  onChange={handleSearchChange}
                  min="0"
                  step="0.5"
                  placeholder="e.g., 10"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search Trucks"}
              </button>
            </form>

            {trucks.length > 0 && (
              <div className="trucks-list">
                <h3>Available Trucks ({trucks.length})</h3>
                {trucks.map((truck) => (
                  <div key={truck.name} className="truck-card">
                    <div className="truck-info">
                      <h4>{truck.truck_number}</h4>
                      <p>Type: {truck.type}</p>
                      <p>Capacity: {truck.capacity} Ton</p>
                      <p>Driver: {truck.driver_name}</p>
                      <p className="price">₹{truck.price_per_km}/KM</p>
                    </div>
                    <button
                      className="book-btn"
                      onClick={() => handleBookTruck(truck.name)}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "my-bookings" && (
          <section className="section">
            <h2>My Bookings</h2>
            {bookings.length > 0 ? (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>From → To</th>
                      <th>Date</th>
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
                        <td>{booking.required_date}</td>
                        <td className={`status ${booking.booking_status}`}>
                          {booking.booking_status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No bookings yet.</p>
            )}
          </section>
        )}

        {activeTab === "track-trip" && (
          <section className="section">
            <h2>Track Your Trip</h2>
            <p>Select a booking from "My Bookings" to view real-time tracking.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;

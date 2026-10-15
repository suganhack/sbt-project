import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function TruckOwnerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("trucks");
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newTruck, setNewTruck] = useState({
    truck_number: "",
    truck_type: "Container",
    truck_model: "",
    capacity: "",
    price_per_km: "",
  });

  useEffect(() => {
    loadTruckOwnerData();
  }, []);

  const loadTruckOwnerData = async () => {
    setLoading(true);
    try {
      // Load trucks for this owner
      const trucksResponse = await axios.get("/api/resource/Truck", {
        params: { filters: [["truck_owner", "=", user.linked_doc_name]] },
      });
      setTrucks(trucksResponse.data.data || []);

      // Load drivers for this owner
      const driversResponse = await axios.get("/api/resource/Driver", {
        params: { filters: [["truck_owner", "=", user.linked_doc_name]] },
      });
      setDrivers(driversResponse.data.data || []);

      // Load active trips
      const bookingsResponse = await axios.post(
        "/api/method/sbt.sbt.api.get_active_bookings",
        { truck_owner_name: user.linked_doc_name }
      );
      setActiveTrips(bookingsResponse.data.message || []);
    } catch (error) {
      console.error("Failed to load truck owner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/resource/Truck", {
        truck_number: newTruck.truck_number,
        truck_owner: user.linked_doc_name,
        truck_type: newTruck.truck_type,
        truck_model: newTruck.truck_model,
        capacity: parseFloat(newTruck.capacity),
        price_per_km: parseFloat(newTruck.price_per_km),
        availability_status: "Available",
      });

      alert("Truck added successfully!");
      setShowAddTruck(false);
      setNewTruck({
        truck_number: "",
        truck_type: "Container",
        truck_model: "",
        capacity: "",
        price_per_km: "",
      });
      loadTruckOwnerData();
    } catch (error) {
      console.error("Failed to add truck:", error);
      alert("Failed to add truck");
    }
  };

  const handleTruckStatusChange = async (truckName, newStatus) => {
    try {
      await axios.put(`/api/resource/Truck/${truckName}`, {
        availability_status: newStatus,
      });
      alert("Truck status updated!");
      loadTruckOwnerData();
    } catch (error) {
      console.error("Failed to update truck status:", error);
      alert("Failed to update truck status");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SBT Truck Owner Portal</h1>
        <p>Welcome, {user.email}</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === "trucks" ? "active" : ""}`}
          onClick={() => setActiveTab("trucks")}
        >
          My Trucks
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
          Active Trips
        </button>
        <button
          className={`nav-tab ${activeTab === "earnings" ? "active" : ""}`}
          onClick={() => setActiveTab("earnings")}
        >
          Earnings
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === "trucks" && (
          <section className="section">
            <div className="section-header">
              <h2>My Trucks</h2>
              <button
                className="add-btn"
                onClick={() => setShowAddTruck(!showAddTruck)}
              >
                {showAddTruck ? "Cancel" : "+ Add Truck"}
              </button>
            </div>

            {showAddTruck && (
              <form onSubmit={handleAddTruck} className="add-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Truck Number (Plate)*</label>
                    <input
                      type="text"
                      value={newTruck.truck_number}
                      onChange={(e) =>
                        setNewTruck({
                          ...newTruck,
                          truck_number: e.target.value,
                        })
                      }
                      placeholder="e.g., TN 38 AB 1234"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Truck Type*</label>
                    <select
                      value={newTruck.truck_type}
                      onChange={(e) =>
                        setNewTruck({ ...newTruck, truck_type: e.target.value })
                      }
                    >
                      <option value="Container">Container</option>
                      <option value="Open Body">Open Body</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Refrigerated">Refrigerated</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      value={newTruck.truck_model}
                      onChange={(e) =>
                        setNewTruck({ ...newTruck, truck_model: e.target.value })
                      }
                      placeholder="e.g., Tata 2523"
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity (Ton)*</label>
                    <input
                      type="number"
                      value={newTruck.capacity}
                      onChange={(e) =>
                        setNewTruck({ ...newTruck, capacity: e.target.value })
                      }
                      placeholder="e.g., 10"
                      step="0.5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price per KM (₹)*</label>
                    <input
                      type="number"
                      value={newTruck.price_per_km}
                      onChange={(e) =>
                        setNewTruck({
                          ...newTruck,
                          price_per_km: e.target.value,
                        })
                      }
                      placeholder="e.g., 35"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  Add Truck
                </button>
              </form>
            )}

            {trucks.length > 0 ? (
              <div className="trucks-grid">
                {trucks.map((truck) => (
                  <div key={truck.name} className="truck-card">
                    <h3>{truck.truck_number}</h3>
                    <p>
                      <strong>Type:</strong> {truck.truck_type}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {truck.capacity} Ton
                    </p>
                    <p>
                      <strong>Rate:</strong> ₹{truck.price_per_km}/KM
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status ${truck.availability_status}`}>
                        {truck.availability_status}
                      </span>
                    </p>
                    <div className="truck-actions">
                      <select
                        value={truck.availability_status}
                        onChange={(e) =>
                          handleTruckStatusChange(truck.name, e.target.value)
                        }
                      >
                        <option value="Available">Available</option>
                        <option value="Offline">Offline</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No trucks added yet.</p>
            )}
          </section>
        )}

        {activeTab === "drivers" && (
          <section className="section">
            <h2>My Drivers</h2>
            {drivers.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Driver Name</th>
                      <th>License Number</th>
                      <th>Mobile</th>
                      <th>License Type</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.name}>
                        <td>{driver.driver_name}</td>
                        <td>{driver.license_number}</td>
                        <td>{driver.mobile_number}</td>
                        <td>{driver.license_type}</td>
                        <td>{driver.expiry_date}</td>
                        <td className={`status ${driver.status}`}>
                          {driver.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No drivers assigned yet.</p>
            )}
          </section>
        )}

        {activeTab === "trips" && (
          <section className="section">
            <h2>Active Trips</h2>
            {activeTrips.length > 0 ? (
              <div className="bookings-grid">
                {activeTrips.map((trip) => (
                  <div key={trip.name} className="trip-card">
                    <h4>{trip.name}</h4>
                    <p>
                      {trip.from_location} → {trip.to_location}
                    </p>
                    <p>
                      <strong>Date:</strong> {trip.required_date}
                    </p>
                    <p className={`status ${trip.booking_status}`}>
                      {trip.booking_status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No active trips.</p>
            )}
          </section>
        )}

        {activeTab === "earnings" && (
          <section className="section">
            <h2>Earnings & Reports</h2>
            <p>Detailed earnings and financial reports will appear here.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default TruckOwnerDashboard;

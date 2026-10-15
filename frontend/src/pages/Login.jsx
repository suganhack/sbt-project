import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login via Frappe's auth endpoint
      const response = await axios.post(
        "/api/resource/User",
        { email, password },
        {
          auth: { username: email, password: password },
        }
      );

      if (response.status === 200) {
        // Get user's role and linked doc
        const userResponse = await axios.get(
          "/api/method/sbt.sbt.api.get_user_role_and_linked_doc"
        );
        onLogin(userResponse.data.message);
      }
    } catch (err) {
      setError("Login failed. Please check your email and password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>SBT</h1>
          <p>Online Truck Booking Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="admin@sbt.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo credentials: admin@sbt.local / admin</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

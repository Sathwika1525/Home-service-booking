
import { useState } from "react";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      window.location.href = "/admin";
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "24px",
      }}
    >
      <h2>Admin Login</h2>
      <p>Sign in to manage your bookings.</p>

      <form onSubmit={handleLogin}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 16px",
          }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "8px 0 16px",
          }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
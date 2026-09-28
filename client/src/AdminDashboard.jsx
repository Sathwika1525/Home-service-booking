
import { useEffect, useState } from "react";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all bookings
  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        window.location.href = "/admin-login";
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin-login";
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to load bookings.");
        }

        setBookings(data);
      } catch (err) {
        setError(err.message || "Unable to fetch bookings.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  // Logout
  function handleLogout() {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin-login";
  }

  // Cancel booking
  async function handleCancel(bookingId) {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin-login";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking.");
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      alert("Booking cancelled successfully!");
    } catch (err) {
      alert(err.message || "Unable to cancel booking.");
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <button onClick={handleLogout}>Logout</button>

      <h2>All Bookings</h2>

      {loading && <p>Loading bookings...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p>No bookings found.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="12"
            style={{
              borderCollapse: "collapse",
              width: "100%",
            }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.customer_name}</td>
                  <td>{booking.customer_phone}</td>
                  <td>{booking.service_name}</td>
                  <td>
                    {new Date(booking.start_at).toLocaleString()}
                  </td>
                  <td>
                    {new Date(booking.end_at).toLocaleString()}
                  </td>
                  <td>
                    ₹{Number(booking.price).toLocaleString("en-IN")}
                  </td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.status === "confirmed" ? (
                      <button
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
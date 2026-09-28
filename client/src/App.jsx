
import { useEffect, useMemo, useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

const serviceIcons = {
  "SVC-001": "❄️",
  "SVC-002": "🔧",
  "SVC-003": "🧹",
  "SVC-004": "🧺",
};

const serviceDescriptions = {
  "SVC-001": "Expert AC inspection, repair and cooling solutions.",
  "SVC-002": "Quick and reliable solutions for leaking pipes and taps.",
  "SVC-003": "Give your home a fresh feel with a deep clean.",
  "SVC-004": "Professional washing machine installation at home.",
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/services`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        return response.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setError("We couldn't load services. Please try again.");
        setLoading(false);
      });
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      service.service_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [services, search]);

  function openBookingForm(service) {
    setSelectedService(service);
    setCustomerName("");
    setCustomerPhone("");
    setBookingDate("");
    setBookingTime("");
    setBookingMessage("");
    setBookingError("");
  }

  function closeBookingForm() {
    if (bookingLoading) return;
    setSelectedService(null);
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();

    setBookingLoading(true);
    setBookingMessage("");
    setBookingError("");

    try {
      const response = await fetch( `${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: selectedService.service_id,
          customer_name: customerName,
          customer_phone: customerPhone,
          booking_date: bookingDate,
          start_time: bookingTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Booking failed. Please try again.");
      }

      setBookingMessage(
        `Booking confirmed! Your booking ID is ${data.booking.id}.`
      );
    } catch (error) {
      setBookingError(error.message || "Unable to create booking.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">⌂</span>
          Home<span>Care</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Our Services</a>
          <a href="#why-us">Why HomeCare?</a>
        </nav>

        <a href="#services" className="nav-button">
          Book a Service <span>↗</span>
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="live-dot"></span>
              YOUR HOME, OUR CARE
            </div>

            <h1>
              Home services,
              <br />
              <span>made simple.</span>
            </h1>

            <p className="hero-description">
              From quick fixes to a sparkling clean home, book trusted
              professionals for all your home needs.
            </p>

            <a href="#services" className="hero-button">
              Explore Our Services <span>→</span>
            </a>

            <div className="hero-trust">
              <span className="trust-icon">✓</span>
              Convenient booking
              <span className="trust-divider">•</span>
              Transparent pricing
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-circle">
              <div className="home-illustration">🏡</div>
            </div>

            <div className="floating-card floating-top">
              <span className="floating-icon">✨</span>
              <div>
                <strong>Care you can trust</strong>
                <small>For every corner of your home</small>
              </div>
            </div>

            <div className="floating-card floating-bottom">
              <span className="floating-icon">🛠️</span>
              <div>
                <strong>Home care, made easy</strong>
                <small>Book your service in minutes</small>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <div>
              <span className="section-tag">WHAT WE OFFER</span>
              <h2>Services for your home</h2>
              <p>Find the right help for your home, all in one place.</p>
            </div>

            <div className="service-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search services..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading && <p className="status-message">Loading services...</p>}

          {error && <p className="error-message">{error}</p>}

          {!loading && !error && (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <article className="service-card" key={service.service_id}>
                  <div className="service-card-top">
                    <div className="service-icon">
                      {serviceIcons[service.service_id] || "🏠"}
                    </div>
                    <span className="service-label">HOME SERVICE</span>
                  </div>

                  <h3>{service.service_name}</h3>

                  <p className="service-description">
                    {serviceDescriptions[service.service_id] ||
                      "Professional home service, right at your doorstep."}
                  </p>

                  <div className="service-meta">
                    <span>◷ {service.duration_minutes} mins</span>
                    <strong>
                      ₹{Number(service.base_price).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <button
                    className="service-book-button"
                    onClick={() => openBookingForm(service)}
                  >
                    Book this service <span>→</span>
                  </button>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="empty-state">
              <span>🔎</span>
              <h3>No services found</h3>
              <p>Try searching with a different service name.</p>
            </div>
          )}
        </section>

        <section className="why-section" id="why-us">
          <span className="section-tag">THE HOMECARE DIFFERENCE</span>
          <h2>A little help goes a long way.</h2>

          <div className="why-grid">
            <div className="why-card">
              <span>📅</span>
              <h3>Easy booking</h3>
              <p>Choose your service and preferred time in just a few steps.</p>
            </div>

            <div className="why-card">
              <span>💰</span>
              <h3>Clear pricing</h3>
              <p>See the service price before confirming your booking.</p>
            </div>

            <div className="why-card">
              <span>🏠</span>
              <h3>At your doorstep</h3>
              <p>Get help with everyday home maintenance and cleaning needs.</p>
            </div>
          </div>
        </section>

        <section className="bottom-cta">
          <div>
            <span>YOUR HOME DESERVES THE BEST</span>
            <h2>Ready to make home care easier?</h2>
            <p>Find a service that fits your needs.</p>
          </div>
          <a href="#services" className="cta-button">
            Find a Service <span>→</span>
          </a>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon">⌂</span>
          Home<span>Care</span>
        </a>
        <p>Making home care simple, one booking at a time.</p>
        <small>© 2026 HomeCare. All rights reserved.</small>
      </footer>

      {selectedService && (
        <div className="booking-overlay" onClick={closeBookingForm}>
          <div
            className="booking-form"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              onClick={closeBookingForm}
              disabled={bookingLoading}
              aria-label="Close booking form"
            >
              ×
            </button>

            {bookingMessage ? (
              <div className="booking-success">
                <div className="success-icon">✓</div>
                <span className="section-tag">BOOKING CONFIRMED</span>
                <h2>You're all set!</h2>
                <p>{bookingMessage}</p>
                <p className="success-detail">
                  Thank you for choosing HomeCare.
                </p>
                <button
                  className="confirm-button"
                  type="button"
                  onClick={closeBookingForm}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="booking-header">
                  <span className="section-tag">BOOK YOUR SERVICE</span>
                  <h2>Let's get you booked.</h2>
                  <p>Enter your details to confirm your service.</p>
                </div>

                <div className="booking-service-summary">
                  <div className="service-icon">
                    {serviceIcons[selectedService.service_id] || "🏠"}
                  </div>
                  <div>
                    <h3>{selectedService.service_name}</h3>
                    <p>{selectedService.duration_minutes} minutes</p>
                  </div>
                  <strong>
                    ₹
                    {Number(selectedService.base_price).toLocaleString("en-IN")}
                  </strong>
                </div>

                <form onSubmit={handleBookingSubmit}>
                  <label htmlFor="customer-name">Your name</label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                  />

                  <label htmlFor="customer-phone">Phone number</label>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    maxLength={20}
                    required
                  />

                  <div className="booking-input-row">
                    <div>
                      <label htmlFor="booking-date">Choose a date</label>
                      <input
                        id="booking-date"
                        type="date"
                        min={getTodayDate()}
                        value={bookingDate}
                        onChange={(event) =>
                          setBookingDate(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="booking-time">Start time</label>
                      <input
                        id="booking-time"
                        type="time"
                        value={bookingTime}
                        onChange={(event) =>
                          setBookingTime(event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="booking-note">
                    <span>ℹ</span>
                    Your booking will be confirmed after availability and
                    booking details are validated.
                  </div>

                  {bookingError && (
                    <p className="error-message">{bookingError}</p>
                  )}

                  <button
                    className="confirm-button"
                    type="submit"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? "Confirming..." : "Confirm Booking"}
                    {!bookingLoading && <span>→</span>}
                  </button>

                  <p className="booking-terms">
                    By confirming, you agree to submit your booking details.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === "/admin-login") {
    return <AdminLogin />;
  }

  if (path === "/admin") {
    return <AdminDashboard />;
  }

  return <HomePage />;
}

export default App;
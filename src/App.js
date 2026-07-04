import React, { useState, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

const API_INVOKE_URL = 'https://afazgywg1e.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const auth = useAuth();

  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null); // Store click coordinates (x,y)
  const [unicorn, setUnicorn] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState("");

  const handleMapClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lat = 30 + (y / rect.height) * 10;
    const lng = -120 + (x / rect.width) * 40;

    // ✅ Store both: lat/lng for API + x/y for unicorn position
    setPickupLocation({ lat: lat.toFixed(4), lng: lng.toFixed(4) });
    setPickupCoords({ x, y }); // Store click position for unicorn
    setUnicorn(null);
    setMessage("");
  }, []);

  const requestRide = useCallback(async () => {
    if (!pickupLocation) {
      setMessage("Please select a pickup location on the map!");
      return;
    }
    setIsRequesting(true);
    setMessage("Requesting your unicorn... 🦄");

    try {
      const token = auth.user?.id_token || auth.user?.access_token;
      const response = await fetch(`${API_INVOKE_URL}/ride`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          PickupLocation: {
            Latitude: parseFloat(pickupLocation.lat),
            Longitude: parseFloat(pickupLocation.lng),
          },
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const parsedBody = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      if (!parsedBody.Unicorn) {
        setMessage("❌ No unicorn assigned.");
        setIsRequesting(false);
        return;
      }

      setUnicorn(parsedBody.Unicorn);
      setMessage(`🎉 Your unicorn ${parsedBody.Unicorn.Name} is on the way! ETA: ${parsedBody.Eta || "Soon"}`);
    } catch (err) {
      console.error("Full error:", err);
      setMessage("❌ Failed to request ride: " + err.message);
    } finally {
      setIsRequesting(false);
    }
  }, [pickupLocation, auth.user]);

  if (auth.isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Wild Rydes...</p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="error-screen">
        <div className="logo-big">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{auth.error.message}</p>
        <button className="btn-login" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="logo-big">🦄</div>
          <h1>Wild Rydes</h1>
          <p>Book a magical unicorn ride in seconds!</p>
          <button className="btn-login" onClick={() => auth.signinRedirect()}>
            Sign In to Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">🦄</div>
        <h1>Wild Rydes</h1>
        <p>Click on the map to request your ride</p>
      </header>

      <div className="user-bar">
        <span>👤 {auth.user?.profile?.email || auth.user?.profile?.preferred_username || "Rider"}</span>
        <button className="btn-signout" onClick={() => auth.removeUser()}>
          Sign Out
        </button>
      </div>

      <main className="main-content">
        <section className="map-section">
          <div className="map-container" onClick={handleMapClick}>
            <div className="map-grid"></div>
            <div className="map-roads"></div>
            <div className="map-buildings">🏙️ 🏢 🏛️ 🏪 🏫</div>

            {/* ✅ PICKUP MARKER - Moves where you click */}
            {pickupCoords && (
              <div 
                className="pickup-marker"
                style={{
                  position: "absolute",
                  left: `${pickupCoords.x}px`,
                  top: `${pickupCoords.y}px`,
                  transform: "translate(-50%, -100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <div className="marker-icon">📍</div>
                <div className="marker-label">Pickup</div>
              </div>
            )}

            {/* ✅ UNICORN MARKER - Same position as pickup when assigned */}
            {unicorn && pickupCoords && (
              <div 
                className="unicorn-marker"
                style={{
                  position: "absolute",
                  left: `${pickupCoords.x}px`,
                  top: `${pickupCoords.y - 40}px`, // Slightly above pickup
                  transform: "translate(-50%, -100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  animation: "bounce 1s infinite",
                  zIndex: 15,
                }}
              >
                <div style={{ fontSize: "2.5rem", filter: "drop-shadow(0 0 15px rgba(0,184,148,0.6))" }}>
                  🦄
                </div>
                <div 
                  style={{
                    fontSize: "0.75rem",
                    color: "#00b894",
                    fontWeight: "700",
                    background: "rgba(0,0,0,0.7)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    marginTop: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {unicorn.Name}
                </div>
              </div>
            )}

            <div className="user-location">
              <div className="pulse"></div>
              <div className="user-dot">📍</div>
            </div>
          </div>

          <div className="location-info">
            <span className="location-pin">📍</span>
            <span>
              {pickupLocation 
                ? `Pickup: ${pickupLocation.lat}, ${pickupLocation.lng}` 
                : "Click anywhere on the map to set pickup location"}
            </span>
          </div>
        </section>

        <button 
          className="btn-request" 
          onClick={requestRide}
          disabled={isRequesting || !pickupLocation}
        >
          {isRequesting ? (
            <>
              <span className="spinner-small"></span>
              Requesting...
            </>
          ) : (
            <>
              <span className="unicorn-icon">🦄</span>
              Request Unicorn
            </>
          )}
        </button>

        {message && !unicorn && (
          <div style={{
            marginTop: "15px",
            padding: "15px",
            backgroundColor: message.includes("❌") ? "rgba(255,107,107,0.2)" : "rgba(0,184,148,0.2)",
            color: message.includes("❌") ? "#ff6b6b" : "#00b894",
            borderRadius: "10px",
            textAlign: "center",
            border: `1px solid ${message.includes("❌") ? "rgba(255,107,107,0.3)" : "rgba(0,184,148,0.3)"}`,
          }}>
            {message}
          </div>
        )}

        {unicorn && (
          <div className="ride-card">
            <div className="ride-card-header">
              <div className="success-badge">✓</div>
              <h3>Unicorn Assigned!</h3>
            </div>

            <div className="unicorn-showcase">
              <div className="unicorn-avatar">
                🦄
                <div className="sparkles">✨</div>
              </div>
              <div className="unicorn-info">
                <div className="unicorn-name">{unicorn.Name}</div>
                <div className="unicorn-tags">
                  <span className="tag color">{unicorn.Color}</span>
                  <span className="tag gender">{unicorn.Gender}</span>
                </div>
              </div>
            </div>

            <div className="ride-details">
              <div className="detail-item">
                <div className="detail-icon">🦄</div>
                <div className="detail-text">
                  <span className="detail-label">Unicorn</span>
                  <span className="detail-value">{unicorn.Name}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🎨</div>
                <div className="detail-text">
                  <span className="detail-label">Color</span>
                  <span className="detail-value">{unicorn.Color}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">⚧</div>
                <div className="detail-text">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{unicorn.Gender}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">📍</div>
                <div className="detail-text">
                  <span className="detail-label">Pickup</span>
                  <span className="detail-value code">
                    {pickupLocation?.lat}, {pickupLocation?.lng}
                  </span>
                </div>
              </div>
            </div>

            <div className="ride-status">
              <div className="status-bar">
                <div className="status-progress"></div>
              </div>
              <span className="status-text">🦄 {unicorn.Name} is galloping to your location!</span>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>🦄 Wild Rydes — Ride the Magic</p>
        <p className="footer-sub">Powered by AWS Amplify, Lambda & DynamoDB</p>
      </footer>
    </div>
  );
}

export default App;
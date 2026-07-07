import React, { useState, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "./App.css";
import "leaflet/dist/leaflet.css";

const API_INVOKE_URL = 'https://fmccge8r5e.execute-api.us-east-1.amazonaws.com/Prod';

// ✅ Custom emoji icons — no images needed!
const pickupIcon = L.divIcon({
  className: 'custom-pickup-icon',
  html: '<div style="font-size:2rem;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const unicornIcon = L.divIcon({
  className: 'custom-unicorn-icon',
  html: '<div style="font-size:2.5rem;filter:drop-shadow(0 0 20px rgba(167,139,250,0.6));">🦄</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const auth = useAuth();
  const [pickupLocation, setPickupLocation] = useState(null);
  const [unicorn, setUnicorn] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [unicornPosition, setUnicornPosition] = useState(null);
  const [message, setMessage] = useState("");

  const defaultCenter = [37.7749, -122.4194];

  const signOutRedirect = () => {
    const clientId = "70mqgaskbmfh79jevb3e47nhie";
    const logoutUri = window.location.origin;
    const cognitoDomain = "https://us-east-1wmqw7ftia.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const handleMapClick = useCallback((latlng) => {
    setPickupLocation({
      lat: latlng.lat.toFixed(4),
      lng: latlng.lng.toFixed(4),
    });
    setUnicorn(null);
    setMessage("");
  }, []);

  const requestRide = useCallback(async () => {
    if (!pickupLocation) {
      setMessage("📍 Please select a pickup location on the map!");
      return;
    }

    const token = auth.user?.id_token || auth.user?.access_token;
    if (!token) {
      setMessage("❌ Please sign in again.");
      return;
    }

    setIsRequesting(true);
    setMessage("🦄 Requesting your unicorn...");

    try {
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
      const parsedBody = data.body ? 
        (typeof data.body === "string" ? JSON.parse(data.body) : data.body) 
        : data;

      if (!parsedBody.Unicorn) {
        setMessage("❌ No unicorn assigned.");
        setIsRequesting(false);
        return;
      }

      setUnicorn(parsedBody.Unicorn);
      setMessage(`🎉 ${parsedBody.Unicorn.Name} is on the way!`);
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Failed to request ride: " + err.message);
    } finally {
      setIsRequesting(false);
    }
  }, [pickupLocation, auth.user]);

  const getColorStyle = (color) => {
    const colors = {
      'Golden': { bg: '#FFD700', text: '#8B6914', shadow: 'rgba(255,215,0,0.4)' },
      'White': { bg: '#F8F9FA', text: '#495057', shadow: 'rgba(248,249,250,0.4)' },
      'Yellow': { bg: '#FFE066', text: '#B38600', shadow: 'rgba(255,224,102,0.4)' },
    };
    return colors[color] || { bg: '#E0E0E0', text: '#666', shadow: 'rgba(224,224,224,0.4)' };
  };

  const getGenderIcon = (gender) => gender === 'Male' ? '♂️' : '♀️';

  if (auth.isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner">🦄</div>
        <p>Loading Wild Rydes...</p>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="error-screen">
        <h2>⚠️ Something went wrong</h2>
        <p>{auth.error.message}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="logo">🦄</div>
          <h1>Wild Rydes</h1>
          <p>Book a magical unicorn ride in seconds!</p>
          <button className="btn-primary" onClick={() => auth.signinRedirect()}>
            Sign In to Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">🦄 Wild Rydes</div>
        <div className="user-info">
          <span>👤 {auth.user?.profile?.email || "Rider"}</span>
          <button className="btn-signout" onClick={signOutRedirect}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* REAL MAP WITH LEAFLET */}
       <div className="map-wrapper">
  <MapContainer
    center={defaultCenter}
    zoom={13}
    className="real-map"
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    />

    <MapClickHandler onMapClick={handleMapClick} />

    {/* Pickup Marker */}
    {pickupLocation && (
      <Marker
        position={[
          parseFloat(pickupLocation.lat),
          parseFloat(pickupLocation.lng),
        ]}
        icon={pickupIcon}
      >
        <Popup>
          <strong>📍 Pickup Location</strong>
          <br />
          {pickupLocation.lat}, {pickupLocation.lng}
        </Popup>
      </Marker>
    )}

    {/* Unicorn Marker */}
    {unicorn && pickupLocation && (
      <Marker
        position={[
          parseFloat(pickupLocation.lat) + 0.002,
          parseFloat(pickupLocation.lng) + 0.002,
        ]}
        icon={unicornIcon}
      >
        <Popup>
          <strong>🦄 {unicorn.Name}</strong>
          <br />
          Your unicorn is on the way!
        </Popup>
      </Marker>
    )}

    {/* Route Line */}
    {pickupLocation && unicorn && (
      <Polyline
        positions={[
          [
            parseFloat(pickupLocation.lat),
            parseFloat(pickupLocation.lng),
          ],
          [
            parseFloat(pickupLocation.lat) + 0.002,
            parseFloat(pickupLocation.lng) + 0.002,
          ],
        ]}
        pathOptions={{
          color: "#8B5CF6",
          weight: 4,
          dashArray: "10 10",
        }}
      />
    )}
  </MapContainer>
</div>

        <div className="controls">
          <p className="location-text">
            {pickupLocation 
              ? <>📍 <strong>Pickup Location</strong><br/>{pickupLocation.lat}, {pickupLocation.lng}</> 
              : "Click anywhere on the map to set pickup location"}
          </p>

          <button 
            className="btn-request"
            onClick={requestRide}
            disabled={isRequesting || !pickupLocation}
          >
            {isRequesting ? (
              <>
                <span className="btn-spinner">🦄</span>
                Summoning Unicorn...
              </>
            ) : (
              <>
                <span>🦄</span>
                Request Unicorn
              </>
            )}
          </button>

          {message && !unicorn && (
            <div className={`message ${message.includes("❌") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          {unicorn && (
            <div className="unicorn-card-premium">
              <div className="card-shine"></div>
              <div className="card-header">
                <div className="success-badge">
                  <span>✓</span>
                </div>
                <h2>Unicorn Assigned!</h2>
                <p className="subtitle">Your magical ride is confirmed</p>
              </div>

              <div className="unicorn-hero">
                <div className="unicorn-avatar-large">
                  <span className="avatar-emoji">🦄</span>
                  <div className="avatar-glow"></div>
                </div>
                <div className="unicorn-name-large">
                  {unicorn.Name}
                  <span className="name-sparkle">✨</span>
                </div>
              </div>

              <div className="unicorn-stats">
                <div className="stat-item" style={{ '--stat-color': getColorStyle(unicorn.Color).shadow }}>
                  <div className="stat-icon" style={{ background: getColorStyle(unicorn.Color).bg, color: getColorStyle(unicorn.Color).text }}>
                    🎨
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Color</span>
                    <span className="stat-value" style={{ color: getColorStyle(unicorn.Color).text }}>
                      {unicorn.Color}
                    </span>
                  </div>
                </div>

                <div className="stat-item" style={{ '--stat-color': 'rgba(255,107,107,0.3)' }}>
                  <div className="stat-icon" style={{ background: '#FFE5E5', color: '#E74C3C' }}>
                    {getGenderIcon(unicorn.Gender)}
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Gender</span>
                    <span className="stat-value">{unicorn.Gender}</span>
                  </div>
                </div>

                <div className="stat-item" style={{ '--stat-color': 'rgba(0,184,148,0.3)' }}>
                  <div className="stat-icon" style={{ background: '#E5F9F0', color: '#00B894' }}>
                    ⏱️
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">ETA</span>
                    <span className="stat-value">30 seconds</span>
                  </div>
                </div>
              </div>

              <div className="pickup-summary">
                <div className="summary-icon">📍</div>
                <div className="summary-text">
                  <span className="summary-label">Pickup Location</span>
                  <span className="summary-coords">
                    {pickupLocation?.lat}, {pickupLocation?.lng}
                  </span>
                </div>
              </div>

              <div className="status-bar-container">
                <div className="status-track">
                  <div className="status-fill"></div>
                </div>
                <div className="status-text">
                  <span className="status-dot">🟢</span>
                  {unicorn.Name} is galloping to your location!
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
import React, { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import Login from "./Login.js";
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
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("userEmail") || ""
  );
  const [pickupLocation, setPickupLocation] = useState(null);
  const [unicorn, setUnicorn] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [unicornPosition, setUnicornPosition] = useState(null);
  const [message, setMessage] = useState("");

  const defaultCenter = [37.7749, -122.4194];

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setIsLocallyAuthenticated(true);
  };

  const signOutRedirect = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    setIsLocallyAuthenticated(false);
    setUserEmail("");
    setPickupLocation(null);
    setUnicorn(null);
    setMessage("");
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

    if (!isLocallyAuthenticated) {
      setMessage("❌ Please sign in again.");
      return;
    }

    setIsRequesting(true);
    setMessage("🦄 Requesting your unicorn...");

    try {
      // Simulated unicorn data for demo purposes
      const unicornNames = ['Sparkle', 'Rainbow', 'Magic', 'Mystique', 'Luna', 'Nova', 'Phoenix', 'Celestia'];
      const unicornColors = ['Golden', 'White', 'Yellow'];
      const unicornGenders = ['Male', 'Female'];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate random unicorn
      const randomUnicorn = {
        Name: unicornNames[Math.floor(Math.random() * unicornNames.length)],
        Color: unicornColors[Math.floor(Math.random() * unicornColors.length)],
        Gender: unicornGenders[Math.floor(Math.random() * unicornGenders.length)],
        RequestTime: new Date().toLocaleTimeString(),
      };

      setUnicorn(randomUnicorn);
      setMessage(`🎉 ${randomUnicorn.Name} is on the way!`);
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Failed to request ride: " + err.message);
    } finally {
      setIsRequesting(false);
    }
  }, [pickupLocation, isLocallyAuthenticated]);

  const getColorStyle = (color) => {
    const colors = {
      'Golden': { bg: '#FFD700', text: '#8B6914', shadow: 'rgba(255,215,0,0.4)' },
      'White': { bg: '#F8F9FA', text: '#495057', shadow: 'rgba(248,249,250,0.4)' },
      'Yellow': { bg: '#FFE066', text: '#B38600', shadow: 'rgba(255,224,102,0.4)' },
    };
    return colors[color] || { bg: '#E0E0E0', text: '#666', shadow: 'rgba(224,224,224,0.4)' };
  };

  const getGenderIcon = (gender) => gender === 'Male' ? '♂️' : '♀️';

  if (!isLocallyAuthenticated) {
    return <Login onSignIn={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">🦄 Wild Rydes</div>
        <div className="user-info">
          <span>👤 {userEmail || "Rider"}</span>
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
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
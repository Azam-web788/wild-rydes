import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import App from "./App.js";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_FMbOldDUu",
  client_id: "3t7t7a6esgd6q9chhasht0pfn3",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "email openid profile",
  automaticSilentRenew: true,
  loadUserInfo: true,
  metadata: {
    issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_FMbOldDUu",
    authorization_endpoint: "https://us-east-1fmboldduu.auth.us-east-1.amazoncognito.com/oauth2/authorize",
    token_endpoint: "https://us-east-1fmboldduu.auth.us-east-1.amazoncognito.com/oauth2/token",
    userinfo_endpoint: "https://us-east-1fmboldduu.auth.us-east-1.amazoncognito.com/oauth2/userInfo",
    end_session_endpoint: "https://us-east-1fmboldduu.auth.us-east-1.amazoncognito.com/logout",
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
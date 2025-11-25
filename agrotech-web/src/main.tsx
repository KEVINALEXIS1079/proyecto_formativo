import React from "react";
import ReactDOM from "react-dom/client";
import Providers from "./app/providers/Providers";
import App from "./App";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Providers>
        <App />
      </Providers>
    </AuthProvider>
  </React.StrictMode>
);

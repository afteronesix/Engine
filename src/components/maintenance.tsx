// maintenance.tsx
import React from "react";

const Maintenance: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        color: "#333",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧 Maintenance </h1>
      <p style={{ fontSize: "1.25rem", maxWidth: 500 }}>
        We are currently performing system maintenance to provide you with a better experience.
        Please be patient and try again later.
      </p>
    </div>
  );
};

export default Maintenance;

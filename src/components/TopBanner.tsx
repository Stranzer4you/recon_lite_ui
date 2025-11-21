import React from "react";
import "./TopBanner.css";

const TopBanner: React.FC = () => {
  return (
    <div className="top-banner">
      <h1>ReconLite</h1>
      <div className="info">
        Welcome, User | {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default TopBanner;

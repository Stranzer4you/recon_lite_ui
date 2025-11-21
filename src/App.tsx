import React from "react";
import TopBanner from "./components/TopBanner";
import SideBar from "./components/SideBar";
import { Routes, Route, Navigate } from "react-router-dom";
import Transaction from "./pages/Transaction";
import Rules from "./pages/Rules";
import ReconciliationResult from "./pages/ReconciliationResult";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-layout">
      <TopBanner />
      <div className="main-area">
        <div className="sidebar">
          <SideBar />
        </div>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Navigate to="/transactions" />} />
            <Route path="/transactions" element={<Transaction />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/reconciliation" element={<ReconciliationResult />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;

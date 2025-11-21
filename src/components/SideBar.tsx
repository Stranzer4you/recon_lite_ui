import React from "react";
import { NavLink } from "react-router-dom";
import "./SideBar.css";

interface Tab {
  name: string;
  path: string;
}

const tabs: Tab[] = [
  { name: "Transactions", path: "/transactions" },
  { name: "Rules", path: "/rules" },
  { name: "Reconciliation Result", path: "/reconciliation" },
];

const SidebarTabs: React.FC = () => {
  return (
    <div className="sidebar">
      <ul>
        {tabs.map((tab) => (
          <li key={tab.path}>
            <NavLink
              to={tab.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {tab.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarTabs;

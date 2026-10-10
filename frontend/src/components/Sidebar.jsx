import { Clock3, LayoutDashboard, MapPin, UserRound, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Data sensor", path: "/sensors", icon: MapPin },
  { name: "Active History", path: "/history", icon: Clock3 },
  { name: "Profile", path: "/profile", icon: UserRound },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <button className="sidebar-overlay" onClick={onClose} aria-label="Đóng menu" />}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-title">
            <span>IOT CONTROL</span>
          </div>

          <div className="brand-subtitle">TRẠM ĐIỀU KHIỂN IOT</div>

          <button className="sidebar-close" onClick={onClose} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={15} />
              <span className="sidebar-link-name">{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
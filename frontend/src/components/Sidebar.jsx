
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Clock3,
  UserRound,
  X,
} from "lucide-react";
import "./Sidebar.css";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    number: "01",
  },
  {
    name: "Data sensor",
    path: "/sensors",
    icon: MapPin,
    number: "02",
  },
  {
    name: "Active History",
    path: "/history",
    icon: Clock3,
    number: "03",
  },
  {
    name: "Profile",
    path: "/profile",
    icon: UserRound,
    number: "04",
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Đóng menu"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="brand-title">
            <span className="brand-dot" />
            <span>HOMEGRID</span>
          </div>

          <div className="brand-subtitle">
            TRẠM ĐIỀU KHIỂN IOT
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {navigation.map(({ name, path, icon: Icon, number }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={15} />

              <span className="sidebar-link-name">
                {name}
              </span>

              <small>{number}</small>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-status-dot" />
          <span>LOCAL SYSTEM</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
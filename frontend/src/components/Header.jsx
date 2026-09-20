
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import "./Header.css";

const pageTitles = {
  "/": {
    title: "Tổng quan hệ thống",
    subtitle: "DASHBOARD",
  },
  "/sensors": {
    title: "Dữ liệu cảm biến",
    subtitle: "DATA SENSOR",
  },
  "/history": {
    title: "Lịch sử hoạt động",
    subtitle: "ACTIVE HISTORY",
  },
  "/profile": {
    title: "Thông tin cá nhân",
    subtitle: "PROFILE",
  },
};

function Header({ onMenuClick }) {
  const location = useLocation();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const page = pageTitles[location.pathname] || pageTitles["/"];

  const time = now.toLocaleTimeString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="app-header">
      <button
        className="header-menu-button"
        onClick={onMenuClick}
        aria-label="Mở menu"
      >
        <Menu size={20} />
      </button>

      <div className="header-title">
        <h1>{page.title}</h1>
        <span>{page.subtitle}</span>
      </div>

      <div className="header-clock">
        <strong>{time}</strong>
        <span>{date}</span>
      </div>
    </header>
  );
}

export default Header;
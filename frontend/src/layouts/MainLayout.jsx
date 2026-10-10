import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./MainLayout.css";

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={menuOpen} onClose={closeMenu} />

      <main className="main-content">
        <Header onMenuClick={() => setMenuOpen(true)} />

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ActiveHistory from "./pages/ActiveHistory/ActiveHistory";
import Dashboard from "./pages/Dashboard/Dashboard";
import DataSensor from "./pages/DataSensor/DataSensor";
import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sensors" element={<DataSensor />} />
          <Route path="history" element={<ActiveHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
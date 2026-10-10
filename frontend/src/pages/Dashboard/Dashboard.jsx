import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Thermometer, Droplets, Sun, Lightbulb, RefreshCw } from "lucide-react";
import "./Dashboard.css";

const TEMP_MIN = 15;
const TEMP_MAX = 40;
const CHART_POINTS = 20;
const UPDATE_INTERVAL_MS = 5000;
const REFRESH_DELAY_MS = 800;
const TIME_FORMAT_LOCALE = "vi-VN";
const TIME_FORMAT_OPTS = { hour12: false };

const INITIAL_DEVICES = [
  { id: "light1", name: "Đèn 1", location: "Phòng khách", type: "light", on: true },
  { id: "light2", name: "Đèn 2", location: "Phòng ngủ", type: "light", on: false },
  { id: "light3", name: "Đèn 3", location: "Ban công", type: "light", on: false },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const formatTime = (date) => date.toLocaleTimeString(TIME_FORMAT_LOCALE, TIME_FORMAT_OPTS);

function generateInitialChartData() {
  const now = new Date();
  const data = [];

  for (let i = CHART_POINTS - 1; i >= 0; i--) {
    const timePoint = new Date(now.getTime() - i * UPDATE_INTERVAL_MS);
    data.push({
      time: formatTime(timePoint),
      temperature: +(26 + Math.random() * 2).toFixed(1),
      humidity: Math.floor(55 + Math.random() * 10),
      light: Math.floor(10 + Math.random() * 50),
    });
  }
  return data;
}

function generateNextPoint(lastPoint) {
  return {
    time: formatTime(new Date()),
    temperature: +clamp(
      lastPoint.temperature + (Math.random() * 0.4 - 0.2),
      TEMP_MIN,
      TEMP_MAX
    ).toFixed(1),
    humidity: clamp(Math.floor(lastPoint.humidity + (Math.random() * 4 - 2)), 0, 100),
    light: Math.max(0, Math.floor(lastPoint.light + (Math.random() * 10 - 5))),
  };
}

function Dashboard() {
  const [chartData, setChartData] = useState(generateInitialChartData);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [loading, setLoading] = useState(false);

  const sensors = useMemo(() => {
    const last = chartData[chartData.length - 1];
    return {
      temperature: last.temperature,
      humidity: last.humidity,
      light: last.light,
    };
  }, [chartData]);

  useEffect(() => {
    const sensorInterval = setInterval(() => {
      setChartData((prevData) => {
        const lastPoint = prevData[prevData.length - 1];
        const newPoint = generateNextPoint(lastPoint);
        return [...prevData.slice(1), newPoint];
      });
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(sensorInterval);
  }, []);

  const fetchDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      setChartData(generateInitialChartData());
      setLoading(false);
    }, REFRESH_DELAY_MS);
  };

  const toggleDevice = (device) => {
    setDevices((prev) =>
      prev.map((item) => (item.id === device.id ? { ...item, on: !item.on } : item))
    );
  };

  const sensorCards = [
    { label: "Nhiệt độ", value: sensors.temperature, unit: "°C", icon: Thermometer, color: "temperature" },
    { label: "Độ ẩm", value: sensors.humidity, unit: "%", icon: Droplets, color: "humidity" },
    { label: "Độ sáng", value: sensors.light, unit: "lux", icon: Sun, color: "light" },
  ];

  return (
    <main className="home-dashboard">
      <section className="home-dashboard-sensors">
        {sensorCards.map(({ label, value, unit, icon: Icon, color }) => (
          <article className={`home-sensor-card ${color}`} key={label}>
            <div className="home-sensor-label">
              <Icon size={14} />
              <span>{label}</span>
            </div>

            <div className="home-sensor-reading">
              <strong>{value}</strong>
              <span>{unit}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="home-dashboard-main">
        <article className="home-chart-panel">
          <div className="home-chart-heading">
            <h2>Biểu đồ giá trị các thông số theo thời gian</h2>

            <div className="home-chart-legend">
              <span className="legend-temp">
                <i /> Nhiệt độ (°C)
              </span>
              <span className="legend-humidity">
                <i /> Độ ẩm (%)
              </span>
              <span className="legend-light">
                <i /> Độ sáng (lux)
              </span>
            </div>
          </div>

          <div className="home-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" />

                <XAxis
                  dataKey="time"
                  minTickGap={20}
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Arial" }}
                  tickLine={false}
                />

                <YAxis
                  domain={["auto", "auto"]}
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "Arial" }}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                />

                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #dfe7ef",
                    borderRadius: 8,
                    color: "#0f172a",
                    fontSize: 12,
                    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff795f"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />

                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="humidity"
                  stroke="#42c8e9"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />

                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="light"
                  stroke="#e9bd32"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <span className="home-chart-y-label">Giá trị chung</span>
        </article>

        <aside className="home-device-panel">
          <div className="home-device-heading">
            <h2>Điều khiển thiết bị</h2>
            <span>Gửi yêu cầu đến ESP32</span>
          </div>

          <div className="home-device-list">
            {devices.map((device) => (
              <div className="home-device-row" key={device.id}>
                <div className={`home-device-icon ${device.on ? "is-on" : ""}`}>
                  <Lightbulb size={15} />
                </div>

                <div className="home-device-details">
                  <strong>{device.name}</strong>
                  <span>{device.location} · </span>
                  <small className={device.on ? "is-on" : ""}>
                    {device.on ? "Bật" : "Tắt"}
                  </small>
                </div>

                <button
                  className={`home-device-switch ${device.on ? "is-on" : ""}`}
                  onClick={() => toggleDevice(device)}
                  aria-label={`Điều khiển ${device.name}`}
                  aria-pressed={device.on}
                >
                  <span />
                </button>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <button className="home-dashboard-refresh" onClick={fetchDashboard} disabled={loading}>
        <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
        {loading ? "Đang tải" : "Làm mới dữ liệu"}
      </button>
    </main>
  );
}

export default Dashboard;
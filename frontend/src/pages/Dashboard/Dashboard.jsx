import { useCallback, useEffect, useMemo, useState } from "react";
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
import { fetchLatestSensors } from "../../services/sensorService";
import { fetchDevices, toggleDeviceApi } from "../../services/deviceService";
import "./Dashboard.css";

const CHART_POINTS = 20;
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";
const RECONNECT_MS = 3000;
const TIME_FORMAT_LOCALE = "vi-VN";
const TIME_FORMAT_OPTS = { hour12: false };
const LIGHT_DIVISOR = 40; // hệ số chia chỉ dùng để vẽ biểu đồ

const formatTime = (date) => date.toLocaleTimeString(TIME_FORMAT_LOCALE, TIME_FORMAT_OPTS);

const round = (v, digits = 1) => (typeof v === "number" ? +v.toFixed(digits) : v);

const toPoint = (r) => ({
  time: formatTime(new Date(r.timestamp)),
  temperature: round(r.temperature, 1),
  humidity: round(r.humidity, 1),
  light: round(r.light, 0),
  lightChart: typeof r.light === "number" ? round(r.light / LIGHT_DIVISOR, 1) : null,
});

const toDevice = (d) => ({
  id: d.id,
  name: d.name,
  location: d.location,
  on: d.status === "ON",
});

function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [busyIds, setBusyIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const sensors = useMemo(() => {
    const last = chartData[chartData.length - 1];
    return {
      temperature: last?.temperature ?? "--",
      humidity: last?.humidity ?? "--",
      light: last?.light ?? "--",
    };
  }, [chartData]);

  // Tải dữ liệu ban đầu qua REST
  const loadInitial = useCallback(async () => {
    try {
      const [rows, deviceList] = await Promise.all([
        fetchLatestSensors(CHART_POINTS),
        fetchDevices(),
      ]);
      setChartData(rows.map(toPoint));
      setDevices(deviceList.filter((d) => d.mqttKey).map(toDevice));
      setError("");
    } catch {
      setError("Không kết nối được server");
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Nhận dữ liệu realtime qua WebSocket
  useEffect(() => {
    let ws;
    let timer;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        loadInitial(); // nối lại sau khi mất mạng thì tải bù dữ liệu bị hụt
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closed) timer = setTimeout(connect, RECONNECT_MS);
      };

      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        if (msg.type === "sensor") {
          setChartData((prev) => [...prev, toPoint(msg.data)].slice(-CHART_POINTS));
        } else if (msg.type === "device") {
          setDevices((prev) =>
            prev.map((d) => (d.id === msg.data.id ? { ...d, on: msg.data.on } : d))
          );
        }
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(timer);
      ws?.close();
    };
  }, [loadInitial]);

  const fetchDashboard = async () => {
    setLoading(true);
    await loadInitial();
    setLoading(false);
  };

  const toggleDevice = async (device) => {
    setBusyIds((prev) => [...prev, device.id]);
    setError("");

    try {
      await toggleDeviceApi(device.id, !device.on);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, on: !device.on } : d))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Không gửi được lệnh");
    } finally {
      setBusyIds((prev) => prev.filter((id) => id !== device.id));
    }
  };

  const sensorCards = [
    { label: "Nhiệt độ", value: sensors.temperature, unit: "°C", icon: Thermometer, color: "temperature" },
    { label: "Độ ẩm", value: sensors.humidity, unit: "%", icon: Droplets, color: "humidity" },
    { label: "Độ sáng", value: sensors.light, unit: "lux", icon: Sun, color: "light" },
  ];

  return (
    <main className="home-dashboard">
      {!connected && (
        <p style={{ color: "#d97706", fontSize: 13 }}>
          Mất kết nối realtime, đang thử kết nối lại...
        </p>
      )}
      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
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
                <i /> Độ sáng (lux) (÷{LIGHT_DIVISOR})
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
                  formatter={(value, name, item) =>
                    name === "Độ sáng" ? [item.payload.light, name] : [value, name]
                  }
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
                  name="Nhiệt độ"
                  stroke="#ff795f"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />

                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="humidity"
                  name="Độ ẩm"
                  stroke="#42c8e9"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />

                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="lightChart"
                  name="Độ sáng"
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
            {devices.map((device) => {
              const busy = busyIds.includes(device.id);

              return (
                <div className="home-device-row" key={device.id}>
                  <div className={`home-device-icon ${device.on ? "is-on" : ""}`}>
                    <Lightbulb size={15} />
                  </div>

                  <div className="home-device-details">
                    <strong>{device.name}</strong>
                    <span>{device.location} · </span>
                    <small className={device.on ? "is-on" : ""}>
                      {busy ? "Đang chờ..." : device.on ? "Bật" : "Tắt"}
                    </small>
                  </div>

                  <button
                    className={`home-device-switch ${device.on ? "is-on" : ""}`}
                    onClick={() => toggleDevice(device)}
                    disabled={busy}
                    aria-label={`Điều khiển ${device.name}`}
                    aria-pressed={device.on}
                  >
                    <span />
                  </button>
                </div>
              );
            })}
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
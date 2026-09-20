
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Sun,
  Lightbulb,
  Fan,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import "./Dashboard.css";

const chartData = [
  { time: "00:00", temperature: 26.5, humidity: 60, light: 9 },
  { time: "01:00", temperature: 26.2, humidity: 59, light: 8 },
  { time: "02:00", temperature: 26.1, humidity: 61, light: 8 },
  { time: "03:00", temperature: 26.4, humidity: 61, light: 11 },
  { time: "04:00", temperature: 26.7, humidity: 60, light: 10 },
  { time: "05:00", temperature: 27, humidity: 59, light: 8 },
  { time: "06:00", temperature: 27.2, humidity: 57, light: 9 },
  { time: "07:00", temperature: 27.1, humidity: 58, light: 17 },
  { time: "08:00", temperature: 27.5, humidity: 57, light: 35 },
  { time: "09:00", temperature: 27.4, humidity: 56, light: 48 },
  { time: "10:00", temperature: 27.3, humidity: 56, light: 57 },
  { time: "11:00", temperature: 27.1, humidity: 56, light: 63 },
  { time: "12:00", temperature: 26.8, humidity: 56, light: 64 },
  { time: "13:00", temperature: 27, humidity: 55, light: 60 },
  { time: "14:00", temperature: 27.4, humidity: 54, light: 58 },
  { time: "15:00", temperature: 27.2, humidity: 55, light: 51 },
  { time: "16:00", temperature: 27.1, humidity: 55, light: 40 },
  { time: "17:00", temperature: 26.8, humidity: 54, light: 30 },
  { time: "18:00", temperature: 26.4, humidity: 55, light: 8 },
  { time: "19:00", temperature: 26.2, humidity: 55, light: 6 },
  { time: "20:00", temperature: 26.1, humidity: 56, light: 7 },
  { time: "21:00", temperature: 26, humidity: 56, light: 8 },
  { time: "22:00", temperature: 25.9, humidity: 54, light: 9 },
  { time: "23:00", temperature: 25.8, humidity: 54, light: 9 },
];

const initialSensors = {
  temperature: 27.5,
  humidity: 64,
  light: 484,
};

const initialDevices = [
  { id: "light1", name: "Đèn 1", location: "Phòng khách", type: "light", on: true },
  { id: "light2", name: "Đèn 2", location: "Phòng ngủ", type: "light", on: false },
  { id: "fan1", name: "Quạt", location: "Ban công", type: "fan", on: false },
];

function Dashboard() {
  const [sensors, setSensors] = useState(initialSensors);
  const [devices, setDevices] = useState(initialDevices);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/dashboard/"
      );

      if (!response.ok) throw new Error("API error");

      const data = await response.json();

      if (data.sensors) {
        setSensors((prev) => ({ ...prev, ...data.sensors }));
      }

      if (Array.isArray(data.devices)) {
        setDevices((prev) =>
          prev.map((device) => {
            const updated = data.devices.find(
              (item) => item.id === device.id
            );

            return updated
              ? { ...device, ...updated }
              : device;
          })
        );
      }
    } catch (error) {
      console.error("Không thể tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleDevice = async (device) => {
    const newStatus = !device.on;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/devices/${device.id}/control/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Không thể điều khiển");

      setDevices((prev) =>
        prev.map((item) =>
          item.id === device.id
            ? { ...item, on: newStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Điều khiển thiết bị thất bại:", error);
    }
  };

  const sensorCards = [
    {
      label: "Nhiệt độ",
      value: sensors.temperature,
      unit: "°C",
      icon: Thermometer,
      color: "temperature",
    },
    {
      label: "Độ ẩm",
      value: sensors.humidity,
      unit: "%",
      icon: Droplets,
      color: "humidity",
    },
    {
      label: "Độ sáng",
      value: sensors.light,
      unit: "lux",
      icon: Sun,
      color: "light",
    },
  ];

  return (
    <main className="home-dashboard">
      {/* <header className="home-dashboard-header">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <span className="home-dashboard-breadcrumb">
            DASHBOARD
          </span>
        </div>

        <div className="home-dashboard-clock">
          <span>
            {time.toLocaleTimeString("vi-VN", {
              hour12: false,
            })}
          </span>
          <small>
            {time.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </small>
        </div>
      </header> */}

      <section className="home-dashboard-sensors">
        {sensorCards.map((sensor) => {
          const Icon = sensor.icon;

          return (
            <article
              className={`home-sensor-card ${sensor.color}`}
              key={sensor.label}
            >
              <div className="home-sensor-label">
                <Icon size={14} />
                <span>{sensor.label}</span>
              </div>

              <div className="home-sensor-reading">
                <strong>{sensor.value}</strong>
                <span>{sensor.unit}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="home-dashboard-main">
        <article className="home-chart-panel">
          <div className="home-chart-heading">
            <h2>
              Biểu đồ giá trị các thông số theo thời gian
            </h2>

            <div className="home-chart-legend">
              <span className="legend-temp">
                <i /> Nhiệt độ (°C)
              </span>
              <span className="legend-humidity">
                <i /> Độ ẩm (%)
              </span>
              <span className="legend-light">
                <i /> Độ sáng (lux/10)
              </span>
            </div>
          </div>

          <div className="home-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 8,
                  bottom: 0,
                  left: 0,
                }}
              >
                <CartesianGrid
                  stroke="#252e34"
                  strokeDasharray="0"
                />

                <XAxis
                  dataKey="time"
                  interval={2}
                  stroke="#52616b"
                  tick={{
                    fill: "#667782",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 70]}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
                  stroke="#52616b"
                  tick={{
                    fill: "#667782",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                />

                <Tooltip
                  contentStyle={{
                    background: "#151c21",
                    border: "1px solid #303a41",
                    borderRadius: 3,
                    color: "#dce3e8",
                    fontSize: 12,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff795f"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#42c8e9"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />

                <Line
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

          <span className="home-chart-y-label">
            Giá trị chung
          </span>
        </article>

        <aside className="home-device-panel">
          <div className="home-device-heading">
            <h2>Thiết bị</h2>
            <span>ĐIỀU KHIỂN TRỰC TIẾP</span>
          </div>

          <div className="home-device-list">
            {devices.map((device) => {
              const Icon =
                device.type === "fan" ? Fan : Lightbulb;

              return (
                <div className="home-device-row" key={device.id}>
                  <div
                    className={`home-device-icon ${
                      device.on ? "is-on" : ""
                    }`}
                  >
                    <Icon size={15} />
                  </div>

                  <div className="home-device-details">
                    <strong>{device.name}</strong>
                    <span>{device.location} · </span>
                    <small className={device.on ? "is-on" : ""}>
                      {device.on ? "Bật" : "Tắt"}
                    </small>
                  </div>

                  <button
                    className={`home-device-switch ${
                      device.on ? "is-on" : ""
                    }`}
                    onClick={() => toggleDevice(device)}
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

      <button
        className="home-dashboard-refresh"
        onClick={fetchDashboard}
        disabled={loading}
      >
        <RefreshCw
          size={14}
          className={loading ? "is-spinning" : ""}
        />
        {loading ? "Đang tải" : "Làm mới dữ liệu"}
      </button>
    </main>
  );
}

export default Dashboard;
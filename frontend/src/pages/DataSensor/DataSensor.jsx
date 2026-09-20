
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Thermometer,
  Droplets,
  Sun,
} from "lucide-react";
import "./DataSensor.css";

const sensorTypes = {
  temperature: {
    label: "Nhiệt độ",
    unit: "°C",
    className: "temperature",
    Icon: Thermometer,
  },
  humidity: {
    label: "Độ ẩm",
    unit: "%",
    className: "humidity",
    Icon: Droplets,
  },
  light: {
    label: "Độ sáng",
    unit: "lux",
    className: "light",
    Icon: Sun,
  },
};

const sampleValues = [
  ["humidity", 68.3, "09:20"],
  ["light", 544, "09:03"],
  ["temperature", 22.9, "08:46"],
  ["temperature", 23.3, "08:29"],
  ["light", 352, "08:12"],
  ["temperature", 25.4, "07:55"],
  ["temperature", 30.2, "07:38"],
  ["humidity", 61.5, "07:21"],
  ["humidity", 71.5, "07:04"],
  ["light", 464, "06:47"],
  ["temperature", 27.5, "06:30"],
  ["humidity", 65.2, "06:13"],
  ["light", 420, "05:56"],
  ["temperature", 26.8, "05:39"],
  ["humidity", 70.1, "05:22"],
  ["light", 380, "05:05"],
];

const sampleData = Array.from({ length: 46 }, (_, index) => {
  const item = sampleValues[index % sampleValues.length];
  const day = index < 10 ? 15 : 14;
  const id = 142 - index;

  return {
    id: `SN-${id}`,
    sensor: item[0],
    value: item[1],
    time: item[2],
    date: `2026-08-${day}`,
  };
});

function DataSensor() {
  const [sensorFilter, setSensorFilter] = useState("all");
  const [startDate, setStartDate] = useState("2026-08-14");
  const [endDate, setEndDate] = useState("2026-08-15");
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    sensor: "all",
    start: "2026-08-14",
    end: "2026-08-15",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");

  const pageSize = 10;

  const filteredData = useMemo(() => {
    const result = sampleData.filter((item) => {
      const matchesSensor =
        appliedFilters.sensor === "all" ||
        item.sensor === appliedFilters.sensor;

      const matchesStart =
        !appliedFilters.start ||
        item.date >= appliedFilters.start;

      const matchesEnd =
        !appliedFilters.end ||
        item.date <= appliedFilters.end;

      const keyword = appliedFilters.search.toLowerCase();

      const matchesSearch =
        !keyword ||
        item.id.toLowerCase().includes(keyword) ||
        sensorTypes[item.sensor].label
          .toLowerCase()
          .includes(keyword) ||
        String(item.value).includes(keyword);

      return (
        matchesSensor &&
        matchesStart &&
        matchesEnd &&
        matchesSearch
      );
    });

    return result.sort((a, b) => {
      const dateTimeA = new Date(
        `${a.date}T${a.time}:00`
      ).getTime();

      const dateTimeB = new Date(
        `${b.date}T${b.time}:00`
      ).getTime();

      return sortOrder === "desc"
        ? dateTimeB - dateTimeA
        : dateTimeA - dateTimeB;
    });
  }, [appliedFilters, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageData = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const applyFilters = () => {
    setAppliedFilters({
      sensor: sensorFilter,
      start: startDate,
      end: endDate,
      search: search.trim(),
    });

    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSensorFilter("all");
    setStartDate("");
    setEndDate("");
    setSearch("");

    setAppliedFilters({
      sensor: "all",
      start: "",
      end: "",
      search: "",
    });

    setCurrentPage(1);
  };

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const [now] = useState(() => new Date());
  const toggleSortOrder = () => {
    setSortOrder((prev) =>
      prev === "desc" ? "asc" : "desc"
    );

    setCurrentPage(1);
  };

  return (
    <main className="sensor-page">
      {/* <header className="sensor-page-header">
        <div>
          <h1>Dữ liệu cảm biến</h1>
          <span>DATA SENSOR</span>
        </div>

        <div className="sensor-page-clock">
          <span>
            {now.toLocaleTimeString("vi-VN", {
              hour12: false,
            })}
          </span>
          <small>
            {now.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </small>
        </div>
      </header> */}

      <section className="sensor-filter-panel">
        <div className="sensor-filter-group sensor-type-filter">
          <label htmlFor="sensor-type">LOẠI CẢM BIẾN</label>
          <select
            id="sensor-type"
            value={sensorFilter}
            onChange={(event) =>
              setSensorFilter(event.target.value)
            }
          >
            <option value="all">Tất cả</option>
            <option value="temperature">Nhiệt độ</option>
            <option value="humidity">Độ ẩm</option>
            <option value="light">Độ sáng</option>
          </select>
        </div>

        <div className="sensor-filter-group">
          <label htmlFor="sensor-start">TỪ NGÀY – ĐẾN NGÀY</label>
          <div className="sensor-date-range">
            <input
              id="sensor-start"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />

            <span>→</span>

            <input
              aria-label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
            />
          </div>
        </div>

        <div className="sensor-filter-group sensor-search-group">
          <label htmlFor="sensor-search">TÌM KIẾM GIÁ TRỊ</label>
          <div className="sensor-search-box">
            <Search size={15} />
            <input
              id="sensor-search"
              type="text"
              placeholder="VD: >30, 65%, hoặc ID cảm biến..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
            />
          </div>
        </div>

        <button
          className="sensor-filter-button"
          onClick={applyFilters}
        >
          <Filter size={14} />
          Lọc
        </button>

        <button
          className="sensor-reset-button"
          onClick={resetFilters}
        >
          <RotateCcw size={13} />
          Đặt lại
        </button>
      </section>

      <section className="sensor-table-panel">
        <div className="sensor-table-scroll">
          <table className="sensor-table">
            <thead>
              <tr>
                <th className="sensor-id-column">ID <span>⌄</span></th>
                <th>LOẠI CẢM BIẾN</th>
                <th>GIÁ TRỊ</th>
                <th className="sensor-time-column">
                  <button
                    type="button"
                    className="sensor-sort-button"
                    onClick={toggleSortOrder}
                    title={
                      sortOrder === "desc"
                        ? "Đang sắp xếp mới đến cũ"
                        : "Đang sắp xếp cũ đến mới"
                    }
                  >
                    THỜI GIAN
                    <span className="sensor-sort-icon">
                      {sortOrder === "desc" ? "↓" : "↑"}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {pageData.map((item) => {
                const sensor = sensorTypes[item.sensor];
                const Icon = sensor.Icon;

                return (
                  <tr key={item.id}>
                    <td className="sensor-id-cell">
                      {item.id}
                    </td>

                    <td>
                      <span
                        className={`sensor-type-badge ${sensor.className}`}
                      >
                        <Icon size={10} />
                        {sensor.label}
                      </span>
                    </td>

                    <td className="sensor-value-cell">
                      {item.value}
                      <small>{sensor.unit}</small>
                    </td>

                    <td className="sensor-time-cell">
                      <span>
                        {item.time} ·{" "}
                        {item.date.split("-").reverse().join("/")}
                      </span>
                      <small>
                        {item.date.endsWith("15")
                          ? "12 giờ trước"
                          : "1 ngày trước"}
                      </small>
                    </td>
                  </tr>
                );
              })}

              {pageData.length === 0 && (
                <tr>
                  <td colSpan="4" className="sensor-empty">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="sensor-table-footer">
          <span>
            Hiển thị{" "}
            {filteredData.length === 0
              ? 0
              : (safePage - 1) * pageSize + 1}
            –
            {Math.min(
              safePage * pageSize,
              filteredData.length
            )}{" "}
            / {filteredData.length}
          </span>

          <div className="sensor-pagination">
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                className={safePage === page ? "active" : ""}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </footer>
      </section>
    </main>
  );
}

export default DataSensor;
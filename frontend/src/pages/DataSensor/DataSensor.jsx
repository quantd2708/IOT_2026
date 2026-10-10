import { useMemo, useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import "./DataSensor.css";

const DEFAULT_PAGE_SIZE = 10;
const PAGINATION_DELTA = 1;

const SENSOR_TYPES = {
  temperature: { label: "Nhiệt độ", unit: "°C" },
  humidity: { label: "Độ ẩm", unit: "%" },
  light: { label: "Độ sáng", unit: "lux" },
};

const SAMPLE_VALUES = [
  ["humidity", 68.3, "09:20:15"],
  ["light", 544, "09:03:42"],
  ["temperature", 22.9, "08:46:18"],
  ["temperature", 23.3, "08:29:35"],
  ["light", 352, "08:12:27"],
  ["temperature", 25.4, "07:55:11"],
  ["temperature", 30.2, "07:38:54"],
  ["humidity", 61.5, "07:21:36"],
  ["humidity", 71.5, "07:04:22"],
  ["light", 464, "06:47:09"],
  ["temperature", 27.5, "06:30:48"],
  ["humidity", 65.2, "06:13:31"],
  ["light", 420, "05:56:16"],
  ["temperature", 26.8, "05:39:04"],
  ["humidity", 70.1, "05:22:43"],
  ["light", 380, "05:05:28"],
];

const SAMPLE_DATA = Array.from({ length: 46 }, (_, index) => {
  const [sensor, value, time] = SAMPLE_VALUES[index % SAMPLE_VALUES.length];
  const day = index < 10 ? 15 : 14;
  const id = 142 - index;

  return {
    id: `SD-${id}`,
    sensor,
    value,
    time,
    date: `2026-08-${String(day).padStart(2, "0")}`,
  };
});

function getPaginationRange(currentPage, totalPages) {
  const range = [];

  for (let i = 1; i <= totalPages; i++) {
    const isEdge = i === 1 || i === totalPages;
    const isNearCurrent =
      i >= currentPage - PAGINATION_DELTA &&
      i <= currentPage + PAGINATION_DELTA;

    if (isEdge || isNearCurrent) {
      range.push(i);
    }
  }

  const rangeWithDots = [];
  let previous;

  for (const page of range) {
    if (previous) {
      if (page - previous === 2) {
        rangeWithDots.push(previous + 1);
      } else if (page - previous !== 1) {
        rangeWithDots.push("...");
      }
    }

    rangeWithDots.push(page);
    previous = page;
  }

  return rangeWithDots;
}

function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(item) {
  return `${item.time} · ${formatDate(item.date)}`;
}

function DataSensor() {
  const [searchMode, setSearchMode] = useState("all");
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ mode: "all", search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredData = useMemo(() => {
    const keyword = appliedFilters.search.trim().toLowerCase();

    const result = SAMPLE_DATA.filter((item) => {
      const sensor = SENSOR_TYPES[item.sensor];

      if (["temperature", "humidity", "light"].includes(appliedFilters.mode)) {
        if (item.sensor !== appliedFilters.mode) {
          return false;
        }

        if (!keyword) {
          return true;
        }

        const searchableText = [
          item.id,
          sensor.label,
          item.value,
          sensor.unit,
          item.time,
          item.date,
          formatDate(item.date),
          formatDateTime(item),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      }

      if (appliedFilters.mode === "time") {
        if (!keyword) {
          return true;
        }

        const timeSearchText = [
          item.time,
          item.date,
          formatDate(item.date),
          formatDateTime(item),
        ]
          .join(" ")
          .toLowerCase();

        return timeSearchText.includes(keyword);
      }

      if (!keyword) {
        return true;
      }

      const searchableText = [
        item.id,
        sensor.label,
        item.value,
        sensor.unit,
        item.time,
        item.date,
        formatDate(item.date),
        formatDateTime(item),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });

    return result.sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time}`).getTime();
      const timeB = new Date(`${b.date}T${b.time}`).getTime();

      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [appliedFilters, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pageData = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const applyFilters = () => {
    setAppliedFilters({
      mode: searchMode,
      search: search.trim(),
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchMode("all");
    setSearch("");
    setAppliedFilters({
      mode: "all",
      search: "",
    });
    setCurrentPage(1);
  };

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  return (
    <main className="sensor-page">
      <section className="sensor-filter-panel">
        <div className="sensor-filter-group sensor-search-mode-group">
          <label htmlFor="sensor-search-mode">TÌM KIẾM DỮ LIỆU</label>
          <select
            id="sensor-search-mode"
            value={searchMode}
            onChange={(event) => setSearchMode(event.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="temperature">Nhiệt độ</option>
            <option value="humidity">Độ ẩm</option>
            <option value="light">Độ sáng</option>
            <option value="time">Thời gian</option>
          </select>
        </div>

        <div className="sensor-filter-group sensor-search-group">
          <div className="sensor-search-box">
            <Search size={18} />
            <input
              id="sensor-search"
              type="text"
              placeholder={
                searchMode === "time"
                  ? "VD: 09:20:15, 15/08/2026..."
                  : "VD: >30, 65%, SN-142..."
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
        </div>

        <button type="button" className="sensor-filter-button" onClick={applyFilters}>
          Tìm kiếm
        </button>

        <button type="button" className="sensor-reset-button" onClick={resetFilters}>
          <RotateCcw size={15} />
          Đặt lại
        </button>
      </section>

      <section className="sensor-table-panel">
        <div className="sensor-table-scroll">
          <table className="sensor-table">

            <thead>
              <tr>
                <th className="sensor-id-column">ID</th>
                <th className="sensor-type-column">LOẠI CẢM BIẾN</th>
                <th className="sensor-value-column">GIÁ TRỊ</th>
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
                const sensor = SENSOR_TYPES[item.sensor];

                return (
                  <tr key={item.id}>
                    <td className="sensor-id-cell">{item.id}</td>
                    <td className="sensor-type-cell">{sensor.label}</td>
                    <td className="sensor-value-cell">
                      <span>{item.value}</span>
                      <small>{sensor.unit}</small>
                    </td>
                    <td className="sensor-time-cell">
                      {formatDateTime(item)}
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
          <div className="sensor-footer-left">
            <span className="sensor-result-count">
              Hiển thị{" "}
              {filteredData.length === 0 ? 0 : (safePage - 1) * pageSize + 1}{" "}
              – {Math.min(safePage * pageSize, filteredData.length)} /{" "}
              {filteredData.length}
            </span>

            <div className="sensor-page-size">
              <label htmlFor="sensor-page-size">Size page</label>
              <select
                id="sensor-page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="sensor-pagination">
            <button
              type="button"
              className="sensor-pagination-arrow"
              disabled={safePage === 1}
              onClick={() => changePage(safePage - 1)}
              aria-label="Trang trước"
            >
              ‹
            </button>

            {getPaginationRange(safePage, totalPages).map((item, index) =>
              item === "..." ? (
                <span key={`dots-${index}`} className="sensor-pagination-dots">
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={safePage === item ? "active" : ""}
                  onClick={() => changePage(item)}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              className="sensor-pagination-arrow"
              disabled={safePage === totalPages}
              onClick={() => changePage(safePage + 1)}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default DataSensor;